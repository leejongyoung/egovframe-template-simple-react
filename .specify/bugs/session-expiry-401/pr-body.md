## 수정 사유 Reason for modification

- [X] 버그수정 Bug fixes
- [ ] 기능개선 Enhancements
- [ ] 기능추가 Adding features
- [ ] 기타 Others

## 수정된 소스 내용 Modified source

보호 API가 HTTP 401을 반환하면 기존 `response.ok` 검사에서 종료되어 로그인 이동과 인증 상태 초기화가 실행되지 않습니다. 본문 형식과 관계없이 401을 기존 인증 오류 경로로 보내고, 한글 안내·표시용 캐시 초기화·`/login` 전체 이동 후 화면 콜백을 호출하지 않도록 합니다.

`/auth/me`는 익명 상태 조회에도 쓰이므로 자동 이동을 명시적으로 끄고 기존 콜백으로 사용자·역할 상태를 초기화합니다. 익명/만료 쿠키 조회가 공개·로그인 화면에서 반복 이동을 일으키지 않도록 한 것입니다. 다른 HTTP 오류는 JSON `resultMessage` 또는 HTTP 상태를 오류 콜백에 전달하며 HTTP 403을 세션 만료와 구분합니다. README에 이 호출 계약과 백엔드의 httpOnly 쿠키 소유권을 기록했습니다.

관련 fork 이슈:
- https://github.com/leejongyoung/egovframe-template-simple-react/issues/8
- https://github.com/leejongyoung/egovframe-template-simple-react/issues/5

#8이 #5의 non-401 메시지 보존을 같은 작업으로 명시하여 공통 HTTP 응답 분류에 함께 반영했습니다. #5 전체 완료나 백엔드 정책 변경을 주장하지 않습니다. 선행 https://github.com/eGovFramework/egovframe-template-simple-react/pull/133 의 인증 오류 콜백 중단을 유지하며, https://github.com/eGovFramework/egovframe-template-simple-react/pull/151 후 현재 main에 반영된 HTTP 상태 검사를 보완합니다.

기준 main `ae6158dfcf6679a2e1acc5abc3356e9582857f10`에서 만든 독립 커밋이며 변경 경로는 README와 API/인증 코드·행동 회귀 테스트 5개뿐입니다. 별도 backend 코드 변경이나 fork 도구 커밋 의존성은 없습니다.

## JUnit 테스트 JUnit tests

- [ ] JUnit 테스트 JUnit tests
- [X] 수동 테스트 Manual testing (합성 HTTP 서버를 사용한 실제 프론트엔드 브라우저 검사)

- 최종 HEAD `a83f93d`: Node 22.23.4, `vitest run src/api/egovFetch.test.js src/contexts/AuthContext.test.jsx` → **23 passed**. 변경 4개 JS/JSX 파일 ESLint와 `git diff --check` → 성공.
- 검토 전 테스트 리비전 `610bc5f`: Node 22.23.4의 `npm run test:run` → **169 passed / 21 files**, `npm run build` → 성공. 최종 리비전은 부수적인 문구 단언과 변경되지 않은 credentials 테스트 1개를 제거하고 소비자 문서만 추가했습니다. 애플리케이션 코드는 동일하며, 최종 리비전에서 전체 169개를 다시 실행했다고 주장하지 않습니다.
- 수정 전 실제 브라우저 + HTTP 401: `/about/site` 유지, `HTTP error: 401`, 이전 사용자 헤더·캐시 잔존, 로그인 안내 없음.
- 동일한 애플리케이션 코드의 배포 빌드(`npm run preview -- --host 127.0.0.1 --port 3109`): 합성 로그인 쿠키 삭제 후 실제 `/admin/board` 링크 클릭 → 한글 안내 1회, 캐시 초기화, 전체 `/login` 이동, 익명 헤더·로그인 폼 확인. fetch를 모킹하지 않았고 알림 표시만 기록했습니다.

한계: 이 브라우저 검사는 backend 소스의 응답 형식을 재현한 합성 HTTP 서비스와 프론트엔드 간 검사입니다. 실제 backend/DB 로그인→쿠키 삭제 E2E는 실행하지 않았습니다. 개발 StrictMode에서는 두 업무 요청이 발생해 안내도 두 번 관찰되었으며, 동시 요청 안내 억제는 이 수정 범위 밖입니다. httpOnly 쿠키의 삭제·갱신은 백엔드 책임입니다. 원격 CI 성공은 아직 주장하지 않습니다.

## 테스트 브라우저 Test Browser

- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari
- [ ] Opera
- [ ] Internet Explorer
- [X] 기타 Others — Orca 내장 브라우저

## 테스트 스크린샷 또는 캡처 영상 Test screenshots or captured video

수정 전: HTTP 401 이후에도 이전 사용자 헤더가 남은 화면(합성 사용자).

![수정 전](https://raw.githubusercontent.com/leejongyoung/egovframe-template-simple-react/60b62ac08aeb3e196fa9912fc7f8582d6ffcef40/.specify/bugs/session-expiry-401/before.png)

수정 후: 배포 빌드에서 로그인 화면으로 이동하고 익명 헤더로 초기화된 화면.

![수정 후](https://raw.githubusercontent.com/leejongyoung/egovframe-template-simple-react/60b62ac08aeb3e196fa9912fc7f8582d6ffcef40/.specify/bugs/session-expiry-401/after-production.png)
