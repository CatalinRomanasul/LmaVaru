import {storageData} from './generalVariables.js';

console.log(storageData.level1);
console.log(storageData.level2);
console.log(storageData.level3);
const finalBtn = document.querySelector('.special-link');
const errorBtn = document.querySelector('.error')
finalBtn.addEventListener('click',()=>{
  if(storageData.level1 === true
    && storageData.level2 === true
     && storageData.level3 === true
  )
  {
   finalBtn.href = 'varu.html'
  }
  else
  {
    errorBtn.classList.add("errorON")
  }
})
