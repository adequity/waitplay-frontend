<template>
  <div class="privacy-policy">
    <div class="container">
      <header class="header">
        <button @click="goBack" class="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>개인정보처리방침</h1>
      </header>

      <main class="content">
        <p class="intro">
          주식회사 웨잇플레이(이하 "회사")는 개인정보보호법 등 관련 법령에 따라 이용자의 개인정보를 보호하고,
          이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>

        <section class="section">
          <h2>제1조 (개인정보의 수집 및 이용 목적)</h2>
          <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행합니다.</p>
          <ul>
            <li><strong>서비스 제공:</strong> QR코드 기반 고객 참여 서비스, 게임 서비스, 방명록 서비스 제공</li>
            <li><strong>회원 관리:</strong> 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정이용 방지</li>
            <li><strong>마케팅 및 광고:</strong> 이벤트 및 광고성 정보 제공 (선택 동의 시)</li>
            <li><strong>서비스 개선:</strong> 신규 서비스 개발 및 서비스 품질 향상</li>
          </ul>
        </section>

        <section class="section">
          <h2>제2조 (수집하는 개인정보의 항목)</h2>
          <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>

          <h3>1. 필수 수집 항목</h3>
          <ul>
            <li><strong>회원가입 시:</strong> 이메일 주소, 비밀번호, 닉네임</li>
            <li><strong>소셜 로그인 시:</strong> 소셜 계정 식별자, 이메일 주소, 프로필 정보</li>
            <li><strong>서비스 이용 시:</strong> 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보, 기기정보</li>
          </ul>

          <h3>2. 선택 수집 항목</h3>
          <ul>
            <li><strong>방명록 작성 시:</strong> 닉네임, 작성 내용</li>
            <li><strong>게임 이용 시:</strong> 게임 점수, 플레이 기록</li>
            <li><strong>쿠폰 사용 시:</strong> 쿠폰 사용 내역</li>
          </ul>
        </section>

        <section class="section">
          <h2>제3조 (개인정보의 보유 및 이용 기간)</h2>
          <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
          <ul>
            <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)</li>
            <li><strong>서비스 이용 기록:</strong> 3년 (전자상거래법)</li>
            <li><strong>접속 로그:</strong> 3개월 (통신비밀보호법)</li>
          </ul>
        </section>

        <section class="section">
          <h2>제4조 (개인정보의 제3자 제공)</h2>
          <p>회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
          <ul>
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        <section class="section">
          <h2>제5조 (개인정보의 파기)</h2>
          <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
          <ul>
            <li><strong>전자적 파일:</strong> 복구 및 재생이 불가능한 방법으로 영구 삭제</li>
            <li><strong>종이 문서:</strong> 분쇄기로 분쇄하거나 소각</li>
          </ul>
        </section>

        <section class="section">
          <h2>제6조 (정보주체의 권리·의무 및 행사방법)</h2>
          <p>이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
          <ul>
            <li>개인정보 열람 요구</li>
            <li>개인정보 정정·삭제 요구</li>
            <li>개인정보 처리정지 요구</li>
            <li>회원 탈퇴</li>
          </ul>
          <p>위 권리 행사는 서비스 내 설정 메뉴 또는 개인정보 보호책임자에게 서면, 전화, 이메일 등으로 연락하시면 지체없이 조치하겠습니다.</p>
        </section>

        <section class="section">
          <h2>제7조 (개인정보의 안전성 확보 조치)</h2>
          <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <ul>
            <li><strong>관리적 조치:</strong> 내부관리계획 수립·시행, 정기적 직원 교육</li>
            <li><strong>기술적 조치:</strong> 개인정보처리시스템 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
            <li><strong>물리적 조치:</strong> 전산실, 자료보관실 등의 접근통제</li>
          </ul>
        </section>

        <section class="section">
          <h2>제8조 (쿠키의 사용)</h2>
          <p>회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 쿠키(Cookie)를 사용합니다.</p>
          <ul>
            <li><strong>쿠키란?</strong> 웹사이트가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로, 이용자 기기에 저장됩니다.</li>
            <li><strong>사용 목적:</strong> 로그인 유지, 서비스 이용 환경 설정 저장</li>
            <li><strong>거부 방법:</strong> 브라우저 설정에서 쿠키 허용/거부를 선택할 수 있습니다. 쿠키 저장을 거부할 경우 일부 서비스 이용에 어려움이 있을 수 있습니다.</li>
          </ul>
        </section>

        <section class="section">
          <h2>제9조 (개인정보 보호책임자)</h2>
          <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
          <div class="contact-info">
            <p><strong>개인정보 보호책임자</strong></p>
            <ul>
              <li>담당자: 웨잇플레이 개인정보보호팀</li>
              <li>이메일: privacy@waitplay.co.kr</li>
            </ul>
          </div>
          <p>이용자는 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.</p>
        </section>

        <section class="section">
          <h2>제10조 (권익침해 구제방법)</h2>
          <p>개인정보침해로 인한 구제를 받기 위하여 아래의 기관에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
          <ul>
            <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
            <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
            <li>대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
            <li>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</li>
          </ul>
        </section>

        <section class="section">
          <h2>제11조 (개인정보처리방침의 변경)</h2>
          <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
        </section>

        <section class="section effective-date">
          <p><strong>시행일자:</strong> 2024년 1월 1일</p>
          <p><strong>최종 수정일:</strong> 2024년 1월 1일</p>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style scoped>
.privacy-policy {
  min-height: 100vh;
  background: #f8fafc;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  margin: 0 -16px;
  padding: 16px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: #f1f5f9;
  border-radius: 10px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.back-button:hover {
  background: #e2e8f0;
  color: #334155;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.content {
  padding: 24px 0 48px;
}

.intro {
  font-size: 15px;
  line-height: 1.7;
  color: #475569;
  margin-bottom: 32px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.section {
  margin-bottom: 32px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.section h2 {
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #ec4899;
}

.section h3 {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin: 16px 0 8px 0;
}

.section p {
  font-size: 14px;
  line-height: 1.7;
  color: #475569;
  margin: 0 0 12px 0;
}

.section ul {
  margin: 0;
  padding-left: 20px;
}

.section li {
  font-size: 14px;
  line-height: 1.7;
  color: #475569;
  margin-bottom: 8px;
}

.section li strong {
  color: #334155;
}

.contact-info {
  background: #fdf2f8;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
}

.contact-info p {
  margin: 0 0 8px 0;
}

.contact-info ul {
  margin: 0;
}

.contact-info li {
  margin-bottom: 4px;
}

.effective-date {
  text-align: center;
  background: #f1f5f9;
}

.effective-date p {
  margin: 4px 0;
  font-size: 13px;
}
</style>
