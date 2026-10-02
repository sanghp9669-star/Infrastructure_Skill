#!/usr/bin/env python3
import sys
import os
import json
import hashlib
import datetime
import urllib.request
import http.cookiejar
import zipfile
import xml.etree.ElementTree as ET

DEFAULT_URL = 'https://viendatvidaco-my.sharepoint.com/:x:/g/personal/sanghp_viendat_com/IQB36SrdN_ydQreldzHIPv0_AZRCQAFKmucHJgqTLElvuoI?download=1'
STATE_FILE = 'data/sync_state.json'
CURRENT_SKILLS_FILE = 'data/skills_current.json'

def get_timestamp():
    return datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {
        'url': DEFAULT_URL,
        'lastChecksum': '',
        'lastCheckTime': '',
        'lastSyncTime': '',
        'status': 'idle',
        'intervalMinutes': 5,
        'enabled': True,
        'history': []
    }

def save_state(state):
    os.makedirs('data', exist_ok=True)
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

def normalize_sharepoint_url(url):
    if not url:
        return url
    clean_url = url.strip()
    if ('sharepoint.com' in clean_url or 'onedrive' in clean_url) and 'download=1' not in clean_url:
        if '?' in clean_url:
            clean_url += '&download=1'
        else:
            clean_url += '?download=1'
    return clean_url

def download_excel(url):
    clean_url = normalize_sharepoint_url(url)
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    opener.addheaders = [
        ('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    ]
    with opener.open(clean_url, timeout=20) as resp:
        return resp.read()

def parse_excel_bytes(data_bytes):
    import io
    import re
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    
    with zipfile.ZipFile(io.BytesIO(data_bytes)) as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in ss_root.findall('ns:si', ns):
                text = ''.join([t.text or '' for t in si.findall('.//ns:t', ns)])
                shared_strings.append(text)
        
        # Read sheet1 (Team Skill Matrix) or any worksheet available
        sheet_file = 'xl/worksheets/sheet1.xml'
        if sheet_file not in z.namelist():
            sheets = [s for s in z.namelist() if s.startswith('xl/worksheets/sheet') and s.endswith('.xml')]
            if sheets:
                sheet_file = sheets[0]
            else:
                raise Exception('Sheet ma trận kỹ năng không tìm thấy trong file Excel')
            
        s_root = ET.fromstring(z.read(sheet_file))
        
        rows_data = {}
        for row in s_root.findall('.//ns:row', ns):
            r_idx = int(row.attrib.get('r', 0))
            cells = {}
            for cell in row.findall('ns:c', ns):
                c_ref = cell.attrib.get('r', '')
                col_letter = ''.join([c for c in c_ref if c.isalpha()])
                t = cell.attrib.get('t')
                v = cell.find('ns:v', ns)
                val = v.text if v is not None and v.text is not None else ''
                if t == 's' and val.isdigit() and int(val) < len(shared_strings):
                    val = shared_strings[int(val)]
                cells[col_letter] = val
            if cells:
                rows_data[r_idx] = cells
                
        if not rows_data:
            return []
            
        row_indices = sorted(rows_data.keys())
        header_row_idx = row_indices[0]
        header_cells = rows_data[header_row_idx]
        
        col_domain = None
        col_skill = None
        col_owner = None
        col_backup = None
        col_sme = None
        col_evidence = None
        member_cols = {}
        
        for col_letter, header_val in header_cells.items():
            h_clean = header_val.strip()
            h_lower = h_clean.lower()
            if not h_clean:
                continue
            if re.search(r'domain|phân khúc|nhóm', h_lower):
                col_domain = col_letter
            elif re.search(r'skill|kỹ năng|công nghệ', h_lower):
                col_skill = col_letter
            elif re.search(r'owner|chủ quản', h_lower):
                col_owner = col_letter
            elif re.search(r'backup|dự phòng', h_lower):
                col_backup = col_letter
            elif re.search(r'sme|expert|chuyên gia', h_lower):
                col_sme = col_letter
            elif re.search(r'evidence|cert|minh chứng|chứng chỉ', h_lower):
                col_evidence = col_letter
            elif not re.search(r'stt|no\.|id|notes|ghi chú', h_lower):
                member_cols[col_letter] = h_clean

        if not col_domain and 'A' in header_cells: col_domain = 'A'
        if not col_skill and 'B' in header_cells: col_skill = 'B'
        if not col_domain: col_domain = 'A'
        if not col_skill: col_skill = 'B'
        
        if not member_cols:
            default_mems = ['Toàn', 'Long', 'Tuấn', 'Duy', 'Sang', 'Bảo', 'Thông', 'Khánh', 'NV.A']
            cols = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
            for c, m in zip(cols, default_mems):
                member_cols[c] = m
                
        skills = []
        for r_idx in row_indices:
            if r_idx == header_row_idx:
                continue
            cells = rows_data[r_idx]
            
            domain_val = cells.get(col_domain, '').strip()
            skill_val = cells.get(col_skill, '').strip()
            
            if not skill_val or skill_val.lower() in ['kỹ năng', 'skill', 'tên kỹ năng']:
                continue
                
            ratings = {}
            for col_char, mem_name in member_cols.items():
                val = cells.get(col_char, '').strip().upper()
                if val in ['L0', 'L1', 'L2', 'L3', 'L4', 'L5']:
                    ratings[mem_name] = val
                elif val in ['0', '1', '2', '3', '4', '5']:
                    ratings[mem_name] = f'L{val}'
                else:
                    ratings[mem_name] = 'L0'
                    
            owner = cells.get(col_owner, '').strip() if col_owner else ''
            backup = cells.get(col_backup, '').strip() if col_backup else ''
            sme = cells.get(col_sme, '').strip() if col_sme else ''
            evidence = cells.get(col_evidence, '').strip() if col_evidence else ''
            
            skills.append({
                'id': len(skills) + 1,
                'domain': domain_val or 'General',
                'skill': skill_val,
                'ratings': ratings,
                'owner': owner,
                'backup': backup,
                'sme': sme,
                'evidence': evidence
            })
            
        return skills, list(member_cols.values())

def calculate_diff(new_skills, old_skills, members=None):
    if not members:
        members = ['Toàn', 'Long', 'Tuấn', 'Duy', 'Sang', 'Bảo', 'Thông', 'Khánh', 'NV.A']
    old_map = {s['skill']: s for s in old_skills}
    diffs = []

    for s in new_skills:
        name = s['skill']
        if name not in old_map:
            diffs.append({
                'skill': name,
                'domain': s['domain'],
                'type': 'added',
                'changes': [f'Kỹ năng mới được thêm từ file Excel: {name} (Domain: {s["domain"]})']
            })
        else:
            old_s = old_map[name]
            changes = []
            
            # Check owner, backup, sme
            if s.get('owner') and s.get('owner') != old_s.get('owner'):
                changes.append(f"Owner đổi: '{old_s.get('owner') or 'Chưa có'}' → '{s.get('owner')}'")
            if s.get('backup') and s.get('backup') != old_s.get('backup'):
                changes.append(f"Backup đổi: '{old_s.get('backup') or 'Chưa có'}' → '{s.get('backup')}'")
            if s.get('sme') and s.get('sme') != old_s.get('sme'):
                changes.append(f"SME đổi: '{old_s.get('sme') or 'Chưa có'}' → '{s.get('sme')}'")

            # Check ratings
            for m in members:
                new_lvl = s['ratings'].get(m, 'L0')
                old_lvl = old_s['ratings'].get(m, 'L0')
                # If Excel has a concrete non-zero rating that differs
                if new_lvl != 'L0' and new_lvl != old_lvl:
                    changes.append(f"{m}: {old_lvl} → {new_lvl}")

            if changes:
                diffs.append({
                    'skill': name,
                    'domain': s['domain'],
                    'type': 'modified',
                    'changes': changes
                })

    return diffs

def sync(target_url=None, force=False, local_file=None):
    state = load_state()
    url = target_url or state.get('url') or DEFAULT_URL
    now = get_timestamp()
    state['lastCheckTime'] = now
    
    try:
        if local_file and os.path.exists(local_file):
            with open(local_file, 'rb') as f:
                data_bytes = f.read()
            source_desc = f'File tải lên ({os.path.basename(local_file)})'
        else:
            data_bytes = download_excel(url)
            source_desc = 'SharePoint Excel Trực Tuyến'

        if len(data_bytes) < 1000 or data_bytes[:4] != b'PK\x03\x04':
            raise Exception('File tải về không đúng định dạng Excel (XLSX).')
            
        checksum = hashlib.md5(data_bytes).hexdigest()
        prev_checksum = state.get('lastChecksum', '')
        
        is_changed = (checksum != prev_checksum)
        
        # Load existing skills for diffing
        old_skills = []
        if os.path.exists(CURRENT_SKILLS_FILE):
            try:
                with open(CURRENT_SKILLS_FILE, 'r', encoding='utf-8') as cf:
                    old_skills = json.load(cf)
            except Exception:
                pass

        if is_changed or force or not os.path.exists(CURRENT_SKILLS_FILE):
            parsed_skills, excel_members = parse_excel_bytes(data_bytes)
            valid_members = set(excel_members)
            
            # Save downloaded file
            with open('data/last_downloaded.xlsx', 'wb') as f:
                f.write(data_bytes)
                
            # Merge with existing ratings/evidence preserving dynamic edits
            old_map = {s['skill'].strip().lower(): s for s in old_skills}
            for s in parsed_skills:
                sk_key = s['skill'].strip().lower()
                # STRICT FILTER: Only retain members currently defined in Excel columns
                s['ratings'] = {m: s['ratings'].get(m, 'L0') for m in excel_members}
                
                # Owner, Backup, SME: Use REAL data from SharePoint file. If blank in Excel, keep blank ""
                s['owner'] = (s.get('owner') or '').strip()
                s['backup'] = (s.get('backup') or '').strip()
                s['sme'] = (s.get('sme') or '').strip()
                s['evidence'] = (s.get('evidence') or '').strip()

                if sk_key in old_map:
                    old_s = old_map[sk_key]
                    if not s['evidence']: 
                        s['evidence'] = old_s.get('evidence', '')
                    if 'memberEvidence' in old_s:
                        s['memberEvidence'] = {m: ev for m, ev in old_s.get('memberEvidence', {}).items() if m in valid_members}

                # Clear any role assigned to members not in active team
                if s.get('owner') and s.get('owner') not in valid_members: s['owner'] = ''
                if s.get('backup') and s.get('backup') not in valid_members: s['backup'] = ''
                if s.get('sme') and s.get('sme') not in valid_members: s['sme'] = ''

            # Calculate detailed diff
            diffs = calculate_diff(parsed_skills, old_skills, excel_members)

            with open(CURRENT_SKILLS_FILE, 'w', encoding='utf-8') as f:
                json.dump(parsed_skills, f, ensure_ascii=False, indent=2)
                
            state['lastChecksum'] = checksum
            state['lastSyncTime'] = now
            state['status'] = 'success'
            
            if diffs:
                change_msg = f'Đồng bộ thủ công tức thì: Đã kiểm tra và cập nhật {len(diffs)} mục thay đổi từ {source_desc} (Tổng {len(parsed_skills)} kỹ năng)'
            else:
                change_msg = f'Đồng bộ thủ công tức thì: Đã xác thực toàn bộ {len(parsed_skills)} kỹ năng từ {source_desc} (Khớp hoàn toàn)'

            state['history'].insert(0, {
                'timestamp': now,
                'status': 'updated',
                'message': change_msg,
                'itemCount': len(parsed_skills),
                'diffCount': len(diffs)
            })
            state['history'] = state['history'][:25]
            save_state(state)
            
            return {
                'success': True,
                'changed': True,
                'itemCount': len(parsed_skills),
                'diffCount': len(diffs),
                'diff': diffs,
                'lastChecksum': checksum,
                'lastSyncTime': now,
                'lastCheckTime': now,
                'source': source_desc,
                'message': change_msg,
                'skills': parsed_skills,
                'members': excel_members
            }
        else:
            state['status'] = 'unchanged'
            state['history'].insert(0, {
                'timestamp': now,
                'status': 'unchanged',
                'message': f'Kiểm tra thủ công: File Excel trùng khớp 100% (Checksum: {checksum[:8]}). Không có thay đổi mới.',
                'itemCount': len(old_skills)
            })
            state['history'] = state['history'][:25]
            save_state(state)
            
            return {
                'success': True,
                'changed': False,
                'diffCount': 0,
                'diff': [],
                'itemCount': len(old_skills),
                'lastChecksum': checksum,
                'lastSyncTime': state.get('lastSyncTime'),
                'lastCheckTime': now,
                'source': source_desc,
                'message': f'Đã kiểm tra tức thì: File Excel trên {source_desc} hoàn toàn trùng khớp với hệ thống web (Mã băm: {checksum[:8]}).',
                'skills': old_skills
            }
            
    except Exception as e:
        err_msg = str(e)
        state['status'] = 'error'
        state['lastError'] = err_msg
        state['history'].insert(0, {
            'timestamp': now,
            'status': 'error',
            'message': f'Lỗi đồng bộ thủ công: {err_msg}',
            'itemCount': 0
        })
        state['history'] = state['history'][:25]
        save_state(state)
        
        return {
            'success': False,
            'changed': False,
            'error': err_msg,
            'lastCheckTime': now,
            'lastSyncTime': state.get('lastSyncTime'),
            'skills': old_skills
        }

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Sync skills from SharePoint Excel')
    parser.add_argument('url', nargs='?', default=None, help='SharePoint Excel URL')
    parser.add_argument('--force', action='store_true', help='Force sync')
    parser.add_argument('--file', dest='local_file', default=None, help='Local file path')
    parsed_args = parser.parse_args()

    result = sync(parsed_args.url, parsed_args.force, parsed_args.local_file)
    print(json.dumps(result, ensure_ascii=False))
