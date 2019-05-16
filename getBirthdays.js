const VK = require('vk-io'); //Версия 3.2
const vk = new VK();
vk.setToken('5fc38e0a5fc38e0a5fc38e0a125fa4650455fc35fc38e0a038255abdc43193b05fba5be')

function onlyId (groups) {
  return groups.map(x=>x.id)
}

async function getBirthdays(token,data,i,j) {
  const {sex,age_from,age_to,birth_day,birth_month} = data;
  const code =
  `return API.users.search({  
         "sex": ${sex},
         "age_from": ${age_from},
         "age_to": ${age_to},
         "birth_day": ${birth_day},
         "birth_month": ${birth_month},
         "fields": "bdate",
         "hometown": "Белая Холуница"
     }).items;`;
  vk.setToken(token)
    return vk.api.call('execute', { code })
          .then(data => {
            // console.log(`Готово ${i} / ${mix.length}`)
            console.log('Готово ' + i + ' из '+ j,data)
            return data.response
          }).catch(err=>console.log(err))
}

function mixData (req) {
  let bdays = (req) => {
    let monthFrom = +req.bdayFrom.split `-` [1],
      monthTo = +req.bdayTo.split `-` [1],
      dayFrom = +req.bdayFrom.split `-` [2],
      dayTo = +req.bdayTo.split `-` [2],
      j = dayFrom,
      birthDays = [];
    for (let i = monthFrom; i <= monthTo; i++) {
      while (!(i === monthTo && j-1 === dayTo) && j <= 31) {
        birthDays.push({
          birth_month: i,
          birth_day: j
        });
        j++;
      }
      j = 1;
    }
    return birthDays;
  };
  
  let ageRage = (req) =>{
    let ages = []
    for(let i = req.ageFrom;i<=req.ageTo;i++){
      for(let j = req.ageFrom;j<=req.ageTo;j++){
        if(i<j) ages.push({
          age_from:i,
          age_to:j
        })
      }
    }
    return ages;
  }
  
  let mix = (req) => {
    let arr = [],
        days = bdays(req),
        ages = ageRage(req);
    days.forEach(day=>ages.forEach(age=>arr.push({...day,...age,sex:0})));
    return arr
  }

  return mix(req)
}




function flattenDeep(arr1) {
  return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
};

module.exports = (req, res) => {
  const allTokens = [
    'ac258fff61e72eb71c70985886e5853e02880e0d5b9ddd4ee93cf315d0273e477f8c5947af88052cea870', //мой последний токен
    '6c81e7bb3e6e04e0a4b06239792514d3df156c74103247ac055c096ff80cc48a598915c85496dae477dbd',
    '1db474706c211e12be1616bab917f589da3e1a9d475ca01d7efbd400225102839575189ad9aa609ac74e9',//андрюша
    '0b7ba32efd493b5f58b48c57c71251f3d0622e954cd718329db8cefd2329f6d5092bd35601a7fc18b39bd',
    'b51c946d9a01f8dc4c215f4409dd71e12be30f22802edb3a583aec3c7fcbd7d65c9748c7e85038c9878f3'
    // '5fc38e0a5fc38e0a5fc38e0a125fa4650455fc35fc38e0a038255abdc43193b05fba5be' - токен приложения
  ];

  const promises = [];

  function delay(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
  }
  let mix = mixData(req)
  mix.forEach((x,i)=>promises.push(getBirthdays(allTokens[i%4],x,i,mix.length)));
  // mixData(req).forEach((x,i)=>{
  //   promises.push(
  //     setTimeout(()=>{
  //       getBirthdays(allTokens[2],x)
  //           .then(data => console.log("из промиса"))
  //     },i*500)
  //   )
  // });

//   function getBdates(token,data) {
//     return new Promise (function(resolve, reject) {
//         setTimeout(getBirthdays(token,data, function(err, data, res) {
//             if (err) {
//                  reject(err);
//             } else {
//                  resolve(data);
//             }
//         }),5000
//      )
// })};


//   mixData(req).map((partnump, i) => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             getGooglePartResults(partnum)
//                 .then(part => resolve(parseGooglePartResults(part)))
//         }, 1000 * i)
//     })
// });


   Promise.all(promises).then(data =>{
    data = flattenDeep(data)
    console.log('Запрос закончен. Найдено' + data.length)
    res.send([...new Set(data.map(x=>`${x.id} ${x.first_name} ${x.last_name} ${x.bdate}`))].join`\n`)
    console.log('Ответ отправлен')
  }).catch(err=>res.send(err))

}
