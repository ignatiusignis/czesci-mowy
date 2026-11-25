const {test,expect}=require('@playwright/test');
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
 const goal=await page.evaluate(()=>{if(!shotGoal)return {ok:true};const b=$('ball').getBoundingClientRect(),g=document.querySelector('.goal').getBoundingClientRect(),f=document.querySelector('#shot .field').getBoundingClientRect();return {ok:b.left>=g.left-1&&b.right<=g.right+1&&b.top>=g.top-1&&b.bottom<=g.bottom+1,ball:{x:b.x,y:b.y,width:b.width,height:b.height},goal:{x:g.x,y:g.y,width:g.width,height:g.height},field:{x:f.x,y:f.y,width:f.width,height:f.height},ballStyle:{left:$('ball').style.left,top:$('ball').style.top,transition:$('ball').style.transition}}});expect(goal.ok,JSON.stringify(goal)).toBe(true);
 await page.locator('#reviewBtn').click();await page.locator('#nextBtn').click();
 }await expect(page.locator('#summaryTitle')).toHaveText('Koniec meczu!');expect(errors).toEqual([]);
});
test('pause and restart',async({page})=>{await page.goto('/');await page.clock.install();await page.evaluate(()=>{setup(2);start()});await page.clock.runFor(1000);await page.evaluate(()=>pauseGame());await page.clock.runFor(10000);await expect(page.locator('#pause')).toBeVisible();await page.evaluate(()=>resumeGame());await page.clock.runFor(3000);await expect(page.locator('#bottom .answers button')).toHaveCount(3);await page.evaluate(()=>{pauseGame();restartGame()});expect(await page.evaluate(()=>scores)).toEqual([0,0]);await page.clock.runFor(3500);await expect(page.locator('#bottom .answers button')).toHaveCount(3)});

test('practice feedback, correction, goal and pause',async({page})=>{
 await page.goto('/');await page.clock.install();await page.evaluate(()=>{selected=labels.map((_,i)=>i);openMenu(true);startPractice()});
 await expect(page.locator('#practiceGrid button')).toHaveCount(20);
 const ids=await page.evaluate(()=>({good:practiceWords.findIndex(x=>x.category===practiceTarget),bad:practiceWords.findIndex(x=>x.category!==practiceTarget)}));
 await page.locator('#practiceGrid button').nth(ids.bad).click();await page.locator('#practiceCheck').click();
 await expect(page.locator('#practiceGrid button').nth(ids.bad)).toContainText('błąd');await expect(page.locator('#practiceGrid button').nth(ids.good)).toContainText('jeszcze to');
 await page.locator('#practiceGrid button').nth(ids.bad).click();
 const targets=await page.evaluate(()=>practiceWords.map((x,i)=>x.category===practiceTarget?i:-1).filter(i=>i>=0));
 for(const i of targets)await page.locator('#practiceGrid button').nth(i).click();
 await page.locator('#practiceCheck').click();await page.clock.runFor(600);await expect(page.locator('#practiceShot')).toBeVisible();
 await page.evaluate(()=>pauseGame());await page.clock.runFor(5000);await expect(page.locator('#pause')).toBeVisible();await page.evaluate(()=>resumeGame());await page.clock.runFor(2200);await expect(page.locator('#practiceScore')).toHaveText('⚽ Gole: 1');
});
test('two independent touch pointers and no ghost click',async({page})=>{
 await page.goto('/');await page.clock.install();await page.evaluate(()=>{setup(2);start()});await page.clock.runFor(3500);
 await page.evaluate(()=>{const a=document.querySelector('#bottom .answers button'),b=document.querySelector('#top .answers button');for(const [i,el] of [a,b].entries())el.dispatchEvent(new PointerEvent('pointerdown',{pointerType:'touch',pointerId:i+1,bubbles:true,cancelable:true}));for(const id of ['bottom','top'])document.querySelector('#'+id+' .answers button').dispatchEvent(new MouseEvent('click',{detail:1,bubbles:true}));});
 expect(await page.evaluate(()=>data.map(d=>d.idx))).toEqual([1,1]);
});
