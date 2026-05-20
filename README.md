## festival (주막 주문)

### Firebase(Firestore)로 주문 공유하기
이 프로젝트는 Firebase 설정이 있으면 주문을 Firestore에 저장해 **다른 기기/브라우저에서도 관리자 페이지에서 동일한 주문 목록**을 볼 수 있습니다.

#### 1) 환경변수 설정
`.env.example`를 참고해서 아래 값을 `.env.local`에 채워주세요.

#### 2) Firestore 규칙 적용
기본 제공 규칙 파일: `firestore.rules`

- 현재 규칙은 **주문 생성(create)/조회(read)만 허용**하고, **update/delete는 차단**합니다.
- 관리자에서 상태 변경까지 Firestore에 반영하려면 인증(예: Firebase Auth + 커스텀 클레임) 또는 서버(예: Next API Route/Cloud Functions)를 추가해 규칙을 강화하는 방식이 필요합니다.

#### 3) 로컬 실행
```bash
npm install
npm run dev
```

