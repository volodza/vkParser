const VK = require('vk-io'); //Версия 3.2
const vk = new VK();
vk.setToken('5fc38e0a5fc38e0a5fc38e0a125fa4650455fc35fc38e0a038255abdc43193b05fba5be')

function onlyId (groups) {
  return groups.map(x=>x.id)
}

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
  `var groups = [];
   var offset = 0;
   while (offset < 1000){
    var g = API.groups.getById({
       "group_ids": API.groups.search({
         "q": "${q}",
         "type": ${type},
         "city_id": ${city_id},
         "market": ${market},
         "future": ${future},
         "count": 500,
         "offset": offset,
         "sort": ${sort}
       }).items@.id,
       "fields": "members_count,verified,market"
     });
     groups.push(g);
     offset = offset + 500;
   }
   return groups;`;
  vk.setToken(token)
  return vk.api.call('execute', { code })
  .then(data => {
    console.log(data)
    return data.response
  }).catch(err=>err.params)//(err => console.error(err));
}

function byMembersCount (data,req) {
  const {min,max} = req;
  console.log(data.members_count >= min && data.members_count <= max)
  return (data.members_count >= min && data.members_count <= max)
}

function withGoods (data,req){
  return !req.market || data.market.enabled === 1;
}

function onlyOfficial (data,req){
  return !req.verified || data.verified === 1;
}

function filterGroups (data,req){
  data = data.filter(x=>{
    return byMembersCount(x,req) && onlyOfficial(x,req) && withGoods(x,req)
  })
  return onlyId(data)
}

function exactMatch (data,req){
  let {q,exact_phrase} = req;
  // console.log("data",data)
  if(!exact_phrase) return data;
  q.forEach(x=>{
    let reg = new RegExp (`${x}(?=\s|\b|\w|$)`,'i');
    data = data.filter(x=>reg.test(x.name));
  })
  return data
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

  let search_phrases = req.q;
  const promises = [];

  if(req.exact_phrase)search_phrases = search_phrases.map(x=> x + '*')
  console.log(search_phrases)
  search_phrases.forEach(x=>promises.push(getGroups(allTokens[0],req,x)))

  Promise.all(promises).then(data =>{
    data = flattenDeep(data)
    console.log('Запрос закончен.')
    res.send(filterGroups(data,req)||'Нет совпадений')
    console.log('Ответ отправлен')
  })
}
