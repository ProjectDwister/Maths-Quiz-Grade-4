const assert=require('assert');
const fs=require('fs');

const app=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');

new Function(app);

[
 'homeView','gameView','dashboardView','shopView','journeyGrid','practiceGrid','mistakeBtn',
 'dailyBar','visual','feedback','conceptRows','avatarShop','accessoryShop'
].forEach(id=>assert.ok(html.includes('id="'+id+'"'),'Missing DOM target #'+id));

[
 'function adaptiveLevel','recent=c.recent.slice(-5)','function recalcMastery',
 "S.mode==='revision'",'generateForVariant','function renderVisual','function renderDashboard',
 'function renderJourney','function renderShop','function updateDaily','misconception',
 'ownedAccessories','chapterUnlocked','history:[]','function renderSessionResults',
 'function openReviewQuestion','function renderReviewedAnswer','reviewFilter'
].forEach(token=>assert.ok(app.includes(token),'Missing app capability: '+token));

assert.ok(css.includes('.fraction-bar'),'Fraction visual styling missing');
assert.ok(css.includes('.chart'),'Data visual styling missing');
assert.ok(css.includes('.journey'),'Journey styling missing');
assert.ok(css.includes('.concept-table'),'Parent dashboard styling missing');
assert.ok(css.includes('.shop-grid'),'Shop styling missing');
assert.ok(!/(?<!\\$)\\$\\([^)]*\\)\\.forEach/.test(app),'Single-element selector must not be used with forEach');
assert.ok(css.includes('[hidden]{display:none!important}'),'Hidden UI elements must remain hidden');
assert.ok(css.includes('.review-list'),'End-of-test review styling missing');
assert.ok(css.includes('.review-nav'),'Question review navigation styling missing');

console.log('App static checks passed.');
