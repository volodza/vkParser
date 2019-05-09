const VK = require('vk-io'); //Версия 3.2

const vk = new VK();
vk.setToken('5fc38e0a5fc38e0a5fc38e0a125fa4650455fc35fc38e0a038255abdc43193b05fba5be')

// const filterFriends = (friends,req) => {
//   let filtered = [];
//   console.log(friends[0].sex)
//     friends.forEach(x=> {
//       if (byCity(x,req) && bySex(x,req) && byAge(x,req)) filtered.push(x.id)
//     })
//     return filtered;
// }
//
// const byCity = (friend,req) =>
//   !req.query.city || ('city' in friend && friend.city.title === req.query.city);
// const bySex = (friend,req) => !req.query.sex || friend.sex == req.query.sex;
// const byAge = (friend,req) => {
//   if(!friend.bdate || /\d+.\d+.\d+/.test(friend.bdate)) return false; //Вернуть false,если отсутствует год рождения ,либо не соответсвует формтату 00.00.0000
//   if(!req.query.age) return true;
//   //Высчитываем возраст
//   let birthdate = new Date(friend.bdate),
//       cur = new Date(),
//       diff = cur-birthdate,
//       fullYears = Math.floor(diff/31557600000);
//
//   let ageFrom = req.query.age.split('-')[0] || 0 ,
//       ageTo = req.query.age.split('-')[1] || 999;
//
//       return (fullYears >= ageFrom && fullYears <= ageTo);
// }
function onlyId (groups) {
  // console.log(friends)
    return groups.map(x=>x.id)
}

// function getFriends (token,user_id,i) {
//   vk.setToken(token)
//   return vk.api.friends.get({
//             user_id:user_id,
//             fields:'bdate,sex,city'
//          }).then(data => {
//             console.log(`Запрос номер ${i} закончен.`)
//             // console.log(data.items)
//             return data.items
//          }).catch(err => console.error(err));
// }

function getGroups(token,req,q) {
  const {
    type,
    city_id,
    country_id,
    future,
    market,
    sort
  } = req;
  const code =
  `return API.groups.search({
    "q": "${q}",
    "type": ${type},
    "city_id": ${city_id},
    "market": ${market},
    "future": ${future},
    "count": 1000,
    "sort": ${sort}
  }).items@.id;`;
  vk.setToken(token)
  return vk.api.call('execute', { code })
    .then(data => {
      // console.log(`Запрос номер ${i} закончен.`)
      console.log(data)
      return data.response
    }).catch(err=>err.params)//(err => console.error(err));
}

function countMembers () {
  const code =
  `return API.groups.getById({
    "group_ids": "${q}",
    "fields": ${type}
  });`;
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

 const search_phrases = req.q;

 const promises = [];
// "абвгдеёжзийклмнопрстуфхцчшщъыьэюя123456789<>|?_$!№;:@#%^&*()[]{}\\\/+=-.,abcdefghijklmnopqrstuvwxyz".split``.forEach(x=>promises.push(getGroups(allTokens[0],req.city_id,x)))

 search_phrases.forEach(x=>promises.push(getGroups(allTokens[0],req,x)))
 // for (let i = 0; i < req.user_ids.length/10; i++) {
 //   promises.push(getGroups(allTokens[i%3],req.city_id, i));
 // }


 Promise.all(promises).then(data =>{
   // console.log(flattenDeep(data))
   console.log('Запрос закончен.')
   // console.log(data)
   // console.log(''+[...new Set(flattenDeep(data))].length)
   res.send([...new Set(flattenDeep(data))])
   console.log('Ответ отправлен')
 })
}
