const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
test('bank and question generation',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>{if(words.length!==10||words.flat().length!==new Set(words.flat()).size)throw Error('bank');selected=labels.map((_,i)=>i);for(let i=0;i<1000;i++){const q=makeSet();if(new Set(q.map(x=>x.word)).size!==3)throw Error('duplicate question');for(const x of q){const o=options(x.category);if(o.length!==3||new Set(o).size!==3||!o.includes(x.category))throw Error('options')}}});
});
for(const mode of [1,2])test('complete match '+mode,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.clock.install();await page.evaluate(m=>{selected=labels.map((_,i)=>i);setup(m);start()},mode);
 for(let i=0;i<(mode===1?5:10);i++){
 await page.clock.runFor(3500);
 await page.evaluate(()=>{for(let p=0;p<mode;p++)for(let j=0;j<3;j++)answer(p,data[p].opts[0],j)});
 await page.clock.runFor(400);await expect(page.locator('#fireBtn')).toBeVisible();await page.locator('#fireBtn').click();await page.clock.runFor(2700);
 await expect(page.locator('#reviewBtn')).toBeVisible();
 const goal=await page.evaluate(()=>{if(!shotGoal)return true;const b=$('ball').getBoundingClientRect(),g=document.querySelector('.goal').getBoundingClientRect();return b.left>=g.left-1&&b.right<=g.right+1&&b.top>=g.top-1&&b.bottom<=g.bottom+1});expect(goal).toBe(true);
 await page.locator('#reviewBtn').click();await page.locator('#nextBtn').click();
 }await expect(page.locator('#summaryTitle')).toHaveText('Koniec meczu!');expect(errors).toEqual([]);
});
test('pause and restart',async({page})=>{await page.goto('/');await page.clock.install();await page.evaluate(()=>{setup(2);start()});await page.clock.runFor(1000);await page.evaluate(()=>pauseGame());await page.clock.runFor(10000);await expect(page.locator('#pause')).toBeVisible();await page.evaluate(()=>resumeGame());await page.clock.runFor(3000);await expect(page.locator('#bottom .answers button')).toHaveCount(3);await page.evaluate(()=>{pauseGame();restartGame()});expect(await page.evaluate(()=>scores)).toEqual([0,0]);await page.clock.runFor(3500);await expect(page.locator('#bottom .answers button')).toHaveCount(3)});
