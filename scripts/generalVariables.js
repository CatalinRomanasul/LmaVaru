let storageData = JSON.parse(localStorage.getItem('progress')) || {};

let Progress = {
  tries: storageData.tries ?? 100,
  level1: storageData.level1 ?? false,
  level2: storageData.level2 ?? false,
  level3: storageData.level3 ?? false,

  convToStorage() {
    const dataToSave = {
      tries: this.tries,
      level1: this.level1, 
      level2: this.level2,
      level3: this.level3
    };
    localStorage.setItem('progress', JSON.stringify(dataToSave));
  },

  resetProgress() {
    this.tries = 100;
    this.level1 = false;
    this.level2 = false;
    this.level3 = false;
    this.convToStorage();
  },

  checkLvl(lvlId) {
    this[`level${lvlId}`] = true;
    this.convToStorage();
  },

  substractTry() {
    this.tries--;
    this.convToStorage();
  }
};

const messages = {
  errorM: ['Vai cat de prost esti', 'D asta ai picat acces u', 'Mai incearca'],
  endM: ['Bravo bossule', 'Ti a luat ceva', 'Regele!!'],
  
  throwMessage(mesaj) {
    return this[mesaj][Math.floor(Math.random() * this[mesaj].length)];
  }
};

export { Progress, messages ,storageData };