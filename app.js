'use strict'

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';

let activeHabbitID;

/*page*/
const page = {
  menu: document.querySelector('.navigation_list'),
  header: {
    h1: document.querySelector("#header"),
    percent: document.querySelector(".progress_percent"),
    linePercent: document.querySelector(".progress_coverBar")
  },
  content:{
    daysContainer: document.querySelector('.days'),
    day: document.querySelector('.massage_day'),
  },
  popup: {
    window: document.querySelector('.cover'),
    habbitName: document.querySelector('.popupForm input[name="icon"]')
  }
}

/*utils*/

function loadData() {
  const habbitString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitString);
  if(Array.isArray(habbitArray)) {
    habbits = habbitArray
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits))
}

function resetForm(form, fields){
  for(let el of fields){
    form[el].value = ''
  }
}

function validateForm(form, fields){
  let formData = new FormData(form) 
  let res = {}
  for ( let field of fields ){
    const fieldValue = formData.get(field);
    form[field].classList.remove('error')
    if(!fieldValue){
      form[field].classList.add('error')
    }
    res[field] = fieldValue
  }
  let isValid = true
  for ( let el in res ){
    if(!res[el]){
      isValid = false
    }
  }
  if(!isValid){
    return
  }
  return res
}

/*render*/
function rerenderMenu(activeHabit){
  for(const habbit of habbits){
    const existed = document.querySelector(`[menuHabbitId='${habbit.id}']`)
    if(!existed){
      const element = document.createElement('button')
      element.setAttribute('menuHabbitId', habbit.id)
      element.classList.add('btn')
      element.addEventListener('click', ()=>{rerender(habbit.id)})
      element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}">`
      if (activeHabit.id === habbit.id){
        element.classList.add("btn_active")
      }
      page.menu.appendChild(element)
      continue
    }
    if (activeHabit.id === habbit.id){
      existed.classList.add("btn_active")
    }else{
      existed.classList.remove("btn_active")
    } 

  }
}

function rerenderHeader(habbit){
  page.header.h1.innerText = habbit.name
  const progress = habbit.days.length / habbit.target > 1 ? 100 : Math.round(habbit.days.length / habbit.target *100)
  page.header.percent.innerText = progress+'%'
  page.header.linePercent.setAttribute('style',`width:${progress}%`)
}

function rerenderMassage(habbit) {
  page.content.daysContainer.innerHTML = ''
  habbit.days.map((el,index) => {
    const element = document.createElement('div')
    element.classList.add('massage')
    element.innerHTML = `<div class="massage_day">День ${Number(index) + 1}</div>
            <div class="massage_comment">
              ${el.comment}
            </div>
            <button class="massage_delete" onclick=deleteDay(${index})><img src="./images/delete.svg" alt="Удалить"></button>`
    page.content.daysContainer.appendChild(element)
  })
  page.content.day.innerHTML = `День ${habbit.days.length + 1}`
}

function rerender(activeHabitId){
  const activeHabbit = habbits.find(habbit => habbit.id === activeHabitId)
  activeHabbitID = activeHabbit.id
  if(!activeHabitId){
    return
  }
  document.location.replace(document.location.pathname + '#' + activeHabbitID)
  rerenderMenu(activeHabbit)
  rerenderHeader(activeHabbit)
  rerenderMassage(activeHabbit)
}

/*Work with days*/
function addDays(event) {
  event.preventDefault()
  const data = validateForm(event.target, ['comment'])
  if(!data){
    return
  }
  habbits = habbits.map(element => {
    if(element.id === activeHabbitID){
      return {
        ...element,
        days: element.days.concat([{comment: data.comment}])
      }
    }
    return element
  })
  resetForm(event.target, ['comment'])
  saveData()
  rerender(activeHabbitID)
}

function deleteDay(index){
  habbits = habbits.map((el) => {
    if(el.id === activeHabbitID){
      return{
        ...el,
        days: el.days.filter((day) => day.comment !== el.days[index].comment)
      }
    }
    return el
  })
  rerender(activeHabbitID)
  saveData()
}

/*Work with popup*/
function togglePopup(){
  page.popup.window.classList.toggle('cover_active')
}

function setIcon(context, iconName){
  page.popup.habbitName.value = iconName
  document.querySelector('.btnIcons button.btn_active').classList.remove('btn_active')
  context.classList.add('btn_active')
}

function addHabbit(event){
  event.preventDefault()
  const data = validateForm(event.target, ['name', 'icon', 'target'])
  if(!data){
    return
  }
  let maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc:habbit.id,0) 
  habbits.push({
    id:maxId+1,
    icon: data.icon,
    name: data.name,
    target: data.target,
    days: []
  })
  resetForm(event.target,['name', 'target'])
  rerender(maxId+1)
  togglePopup()
}

(() => {
  loadData()
  const hash = Number(document.location.hash.replace('#', ''))
  const urlHabbit = habbits.find(habbit => habbit.id === hash)
  if(urlHabbit){
    rerender(urlHabbit.id)
  } else{
    rerender(habbits[0].id)
  }
})()