import {Progress, messages} from "./generalVariables.js";


const buttonVerificare = document.querySelector('.js-verificare');
const emailInput = document.querySelector('.js-email');
const varOptiune = document.querySelector('.js-tipVar');
const resultBar = document.querySelector('.error')
buttonVerificare.addEventListener('click',()=>{
  if(emailInput.value ==='efteivlad@gmail.com' && varOptiune.value === 'unchi')
 {   console.log('Ai trecut mai departe!')
  Progress.checkLvl(1);
  resultBar.style.color = "green"
  resultBar.innerHTML = messages.throwMessage('endM')
}
else
{Progress.substractTry();
  resultBar.style.color = "red"
resultBar.innerHTML = messages.throwMessage('errorM')
}
})

