import { spawnSync } from 'node:child_process';

function sh(cmd, args){
  const r = spawnSync(cmd, args, { stdio: 'inherit' });
  if(r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed`);
}

function hasChanges(){
  const r = spawnSync('git', ['status','--porcelain'], { encoding: 'utf8' });
  return (r.stdout || '').trim().length > 0;
}

try{
  if(!hasChanges()){
    console.log('[push] no changes');
    process.exit(0);
  }
  sh('git', ['add','-A']);
  const ts = new Date().toISOString().replace('T',' ').replace(/\..+$/,'');
  sh('git', ['commit','-m', `chore: ai-news update ${ts}`]);
  sh('git', ['push']);
  console.log('[push] done');
}catch(e){
  console.error('[push] error', e.message);
  process.exit(1);
}
