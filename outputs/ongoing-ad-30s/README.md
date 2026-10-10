# 온고잉 / ONGOING STUDIO 30초 모션그래픽 광고

> **현재 상태 (2판)**: `source/`의 코드는 실제 에셋 팩(로고, 접수 화면, 스톡 영상)을 쓰도록 바뀌었습니다.
> 에셋 팩과 2판 문서는 **이 저장소가 공개 상태라서 올리지 않았습니다**. 아래 `01~03` 문서는 1판(자리표시자 판)의 기록입니다.
> 2판을 다시 렌더하려면 `python3 source/prepare_assets.py <에셋 팩의 assets 폴더>` 후 `bash source/render.sh`.


기존 고객 접수 프로그램과는 완전히 분리된 별도 폴더입니다. 접수 코드, 서버, 포트, 데이터에는 접근하지 않았습니다.

| 파일 | 내용 |
|---|---|
| `01_product_summary.md` | 상품 이해 요약, 홍보 가능 기능 목록(구현 상태는 미확인), 가상 데이터와 자리표시자 목록 |
| `02_script.md` | 30초 내레이션 대본 |
| `03_storyboard.md` | 초 단위 스토리보드 |
| `source/` | 편집 가능한 모션그래픽 소스 (Remotion + React/TypeScript) |
| `ongoing-ad-30s.mp4` (재렌더 시 `source/out/`에 생성) | 렌더 결과 (1080×1920, 30fps, 30초, 합성 음향 포함, 내레이션 없음) |

## 상태: 잠정판
요청서의 로컬 자료(A~G)와 실서비스 링크를 제작 환경에서 열 수 없어, 요청서 본문만 근거로 만들었습니다.
- 로고, 브랜드 레드, 접수·완료 화면 모양은 **임시**입니다. 실제 값으로 교체가 필요합니다.
- 홍보 기능의 구현 여부는 `RC30_PROGRESS.txt`로 **확인되지 않았습니다**. 광고 공개 전 `01_product_summary.md`의 표를 검증하세요.
- 내레이션은 만들지 않았습니다(유료 API 승인 필요).

## 다시 렌더하기
```
cd source
bash render.sh          # npm install → 음향 합성(Python 3) → 렌더
```
필요: Node 22 이상, Python 3. Remotion은 첫 실행 때 자체 브라우저를 내려받습니다.
(클라우드 샌드박스에서는 설치된 Chromium을 자동으로 사용합니다.)

## 고치는 곳
| 바꿀 것 | 위치 |
|---|---|
| 브랜드 색(레드 등), 글꼴 | `source/src/theme.ts` |
| 로고 | `source/src/parts.tsx`의 `Mark`, `Logo` (실제 로고는 이미지로 바꾸고 `<img src={staticFile(..)}>` 사용) |
| 장면 시간 | `source/src/theme.ts`의 `SCENES` |
| 장면 내용과 문구 | `source/src/Ad.tsx` (S1~S6) |
| 터치음 시점과 배경음 | `source/make_audio.py` (장면 시간과 같은 기준의 초 단위 목록) |

실제 영상 클립을 쓰려면 사용 권한이 확인된 파일만 `source/public/`에 넣으세요.
고객 영상이나 유튜브 영상은 광고에 쓰지 않습니다.
