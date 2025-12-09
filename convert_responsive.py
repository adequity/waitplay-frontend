#!/usr/bin/env python3
"""
핀볼 게임 좌표를 반응형으로 변환하는 스크립트
원래 캔버스 크기: 375 x 667
"""

import re

# 원래 캔버스 크기
ORIGINAL_W = 375
ORIGINAL_H = 667

def convert_coordinate(match):
    """좌표를 반응형 비율로 변환"""
    num = float(match.group(1))
    context = match.group(0)

    # X 좌표인지 Y 좌표인지 판단 (간단한 휴리스틱)
    # x, width, left, right 등이 포함되어 있으면 W 기준
    # y, height, top, bottom 등이 포함되어 있으면 H 기준

    # 파일 전체 읽기
    with open('C:\\Users\\User\\waitplay\\frontend\\src\\game\\scenes\\RealPinballScene.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    # 모든 고정 좌표 찾기
    patterns = [
        # rectangle, circle, text 등의 좌표
        r'\.add\.rectangle\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)',
        r'\.add\.circle\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)',
        r'\.add\.text\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)',
        r'setPosition\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)',
        r'fillCircle\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)',
        r'fillRoundedRect\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)',
    ]

    replacements = []
    for pattern in patterns:
        for match in re.finditer(pattern, content):
            x = float(match.group(1))
            y = float(match.group(2))

            x_ratio = round(x / ORIGINAL_W, 4)
            y_ratio = round(y / ORIGINAL_H, 4)

            old = match.group(0)
            new = old.replace(match.group(1), f'W * {x_ratio}').replace(match.group(2), f'H * {y_ratio}')

            replacements.append((old, new))

    # 중복 제거
    replacements = list(set(replacements))

    # 교체 적용
    for old, new in replacements:
        content = content.replace(old, new)

    # 파일 저장
    with open('C:\\Users\\User\\waitplay\\frontend\\src\\game\\scenes\\RealPinballScene.ts', 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"총 {len(replacements)}개 좌표 변환 완료")

if __name__ == '__main__':
    with open('C:\\Users\\User\\waitplay\\frontend\\src\\game\\scenes\\RealPinballScene.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    # W, H 변수가 이미 있는지 확인
    if 'const W = this.sys.game.config.width as number;' in content:
        print("이미 W, H 변수가 정의되어 있습니다.")

        # 모든 고정 좌표를 찾아서 변환
        patterns = [
            (r'\.add\.rectangle\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)', 'rectangle'),
            (r'\.add\.circle\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)', 'circle'),
            (r'\.add\.text\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)', 'text'),
            (r'setPosition\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)', 'setPosition'),
            (r'fillCircle\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)', 'fillCircle'),
            (r'fillRoundedRect\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)', 'fillRoundedRect'),
            (r'strokeCircle\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)', 'strokeCircle'),
            (r'strokeRoundedRect\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)', 'strokeRoundedRect'),
            (r'fillTriangle\(\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)', 'fillTriangle'),
            (r'\.create\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)', 'create'),
        ]

        count = 0
        for pattern, name in patterns:
            for match in re.finditer(pattern, content):
                x = float(match.group(1))
                y = float(match.group(2))

                # 이미 W * 또는 H * 형식이면 스킵
                before_x = content[max(0, match.start()-10):match.start()]
                if 'W *' in before_x or 'H *' in before_x:
                    continue

                x_ratio = round(x / ORIGINAL_W, 4)
                y_ratio = round(y / ORIGINAL_H, 4)

                old = f"{match.group(1)}, {match.group(2)}"
                new = f"W * {x_ratio}, H * {y_ratio}"

                # 정확한 매칭을 위해 전체 함수 호출 부분 교체
                content = content.replace(old, new, 1)
                count += 1

        # 파일 저장
        with open('C:\\Users\\User\\waitplay\\frontend\\src\\game\\scenes\\RealPinballScene.ts', 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"총 {count}개 좌표 변환 완료")
    else:
        print("W, H 변수가 정의되지 않았습니다")
