# Firebase 준비하기 (한 번만)

워드 아일랜드의 아이디·비밀번호와 기록은 Google Firebase **무료(Spark) 요금제**에 저장돼요. 카드 등록은 필요 없어요.

## 1. 프로젝트 만들기
1. https://console.firebase.google.com 에 Google 계정으로 들어가요.
2. **프로젝트 만들기** → 이름 `word-island` (아무거나 괜찮아요).
3. Google 애널리틱스는 **끄고** 만들어요.

## 2. 웹 앱 추가하고 설정값 복사
1. 프로젝트 첫 화면에서 **`</>` (웹)** 아이콘을 눌러요.
2. 앱 닉네임 `word-island-web`. **Firebase 호스팅은 체크하지 않아요.**
3. 화면에 나오는 `const firebaseConfig = { ... };` 안의 값(apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)을 복사해 두세요. 이 값은 공개돼도 괜찮은 값이에요.

## 3. 로그인 켜기
1. 왼쪽 메뉴 **빌드 › Authentication** → **시작하기**.
2. **로그인 방법** 탭 → **이메일/비밀번호** → 첫 번째 스위치만 **사용 설정** → 저장.
   (이메일 링크는 켜지 않아요. 아이디는 게임 안에서 `아이디@wordisland.local` 로 바뀌어 저장돼요.)

## 4. 기록 저장소(Firestore) 만들기
1. **빌드 › Firestore Database** → **데이터베이스 만들기**.
2. 위치: `asia-northeast3 (서울)`.
3. **프로덕션 모드**로 시작.

## 5. 보안 규칙 넣기
1. Firestore 화면의 **규칙** 탭.
2. 이 저장소의 [`firestore.rules`](../firestore.rules) 내용을 전부 붙여 넣고 **게시**.
   → 자기 기록만 읽고 쓸 수 있게 막아 줘요.

## 6. 게임 주소 허용하기
1. **Authentication › 설정 › 승인된 도메인** → **도메인 추가**.
2. `chemistry3333333a.github.io` 를 추가해요. (`localhost` 는 이미 들어 있어요.)

## 7. (관리자용) 비밀번호 바꾸기 키 받기
비밀번호를 잊은 사람을 도와줄 때만 필요해요.
1. 왼쪽 위 톱니바퀴 **프로젝트 설정 › 서비스 계정** 탭.
2. **새 비공개 키 생성** → 내려받은 JSON 파일 이름을 `service-account.json` 으로 바꿔 이 저장소의 `admin/` 폴더에 넣어요.
3. ⚠️ 이 파일은 **누구에게도 보내지 말고, 깃허브에도 올리지 마세요.** (`.gitignore` 로 막아 두었어요.) 사용법은 [`admin/README.md`](../admin/README.md).
