import {
  Progress,messages

} from "./generalVariables.js";



const sidebar = document.querySelector('.js-toggle');
const verifyButton = document.querySelector('.js-verify');
const mesaj = document.querySelector('js-result');

 function toggleSidebar() {
    document.body.classList.toggle("sidebar-open");
    // Save state in localStorage
    const isOpen = document.body.classList.contains("sidebar-open");
 
  }




  function verifica() {
    const corect = "mos craciun e un om nebun";
    const userText = document.getElementById("userInput").value.trim().toLowerCase();
    const result = document.getElementById("result");

    if (!userText) {
      result.textContent = "Trebuie sa scrii ceva aici dobitocule";
      result.className = "result error";
      Progress.substractTry();
      return;
    }

    if (userText === corect) {
      result.textContent = messages.throwMessage('endM');
      result.className = "result success";
      Progress.checkLvl(2);
    } else {
      result.textContent = messages.throwMessage('errorM');
      result.className = "result error";
    }
  }



document.getElementById('userInput').focus();
sidebar.addEventListener('click',toggleSidebar)
verifyButton.addEventListener('click',verifica)