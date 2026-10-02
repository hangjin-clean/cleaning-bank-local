// 청소뱅크 4호 전용 대량배포 엔진
// 기존 1·2·3호와 완전 분리
// STEP 1: Netlify Function 연결 확인

exports.handler = async function () {
  try {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        ok: true,
        system: "cleaning-bank-4",
        engine: "bulk-publisher",
        version: "1.0",
        message: "청소뱅크 4호 대량배포 엔진 정상 연결"
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        ok: false,
        error: String(error && error.message ? error.message : error)
      })
    };
  }
};
