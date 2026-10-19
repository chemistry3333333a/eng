// 테스트 공용 로더: 브라우저 스크립트를 vm 컨텍스트에서 순서대로 실행
const vm = require('vm'), fs = require('fs'), path = require('path');
function load(files, globals = {}) {
  const ctx = vm.createContext({...globals});
  ctx.window = ctx;
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, {filename: f});
  return ctx;
}
module.exports = {load};
