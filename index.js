const btnStart=document.getElementById('start');
const inputLength=document.getElementById('length');
const inputLimit=document.getElementById('limit');
const container=document.getElementById('content');
const progress=document.getElementById('progress');
const text=document.getElementById('text').innerHTML;
const sentences = text.match(/\(?[^\.\?\!]+[\.!\?]\)?/g);

let articles=new Map()

function render(allCount) {
  let string='';
  let i=0;
  let finishedCount=0;
  for (const [key, value] of articles) {
    let descr=''
    if(value){
      descr=sentences[i];
      finishedCount++
    }
    string+= `<div class='card'><h4 class="card-title">${key}</h4><p>${descr}</p></div>`;
    i++;
  }
  container.innerHTML=string;
  progress.innerHTML=`Progress: ${finishedCount} of ${allCount}`;
  if(finishedCount==allCount){
    btnStart.disabled=false;
    inputLength.disabled=false;
    inputLimit.disabled=false;
  }
}

function queue(objects=[], callback, limit){
  let queue=[];
  let inProcessCount=0;
  let fn=()=>{
    const firstElement=queue.pop();
    if(firstElement){
      inProcessCount++;
      firstElement.fn()
    }
  }
  return objects.map((el, index)=>{
    return new Promise((resolve)=>{
      if(limit<=inProcessCount){
        queue.push(
          {
            id: index,
            fn: ()=>{
              inProcessCount++;
              callback(el).then((ev)=>{
                resolve(ev);
                inProcessCount--
                fn();
              })
            }
          }
        )
      }
      else{
        inProcessCount++;
        callback(el).then((ev)=>{
          resolve(ev);
          inProcessCount--;
          fn(queue);
        })
      }
    })
  })
}

function getRandomString(length){
  let string='';
  while(length>string.length){
    let rundomNumber = Math.floor(Math.random() * text.length)
    string += text.substring(rundomNumber,rundomNumber+1);
  }
  return string
}

function getRandomStrings(arrayLength){
  let array=[];
  while(arrayLength>array.length){
    array.push(getRandomString(Math.random() * (200 - 10) + 10))
  }
  return array;
}

btnStart.addEventListener('click', ()=>{
  const length=inputLength.value;
  const limit=inputLimit.value;
  if(length>0 && limit>0){
    articles.clear();
    container.innerHTML='';
    progress.innerHTML='';
    btnStart.disabled=true;
    inputLength.disabled=true;
    inputLimit.disabled=true;
    let randomStrings=getRandomStrings(length);
    const arts=queue(randomStrings,
    (a) => new Promise((resolve) => {
      articles.set(a, false);
      render(length)
      setTimeout(()=>{resolve(a)}, Math.round(Math.random() * 9000) + 1000);
    }),
    limit);
    arts.forEach(el=>{
      el.then((title)=>{
        articles.set(title, true);
        render(length)
      })
    })
  }
  
})
