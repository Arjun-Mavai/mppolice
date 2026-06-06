import { getAllTestsForAdmin } from './src/app/admin/test-access/actions';

async function run() {
  const tests = await getAllTestsForAdmin();
  const misc = tests.filter(t => t.type === 'MISC').slice(0, 5);
  console.log(misc.map(t => ({ id: t.id, isInstantMode: t.isInstantMode })));
}
run();
