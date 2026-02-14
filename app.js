// ------------------ Language ------------------
let currentLang = localStorage.getItem("lang") || "fa";
const translations = {
  fa: { activeProgram:"برنامه فعال", bodyWeight:"وزن فعلی", managePrograms:"مدیریت برنامه‌ها", bodyMetrics:"آنالیز بدن", archive:"آرشیو", programs:"برنامه‌ها", newProgram:"برنامه جدید", addEntry:"افزودن رکورد", noPrograms:"برنامه‌ای وجود ندارد", invalidValues:"مقادیر نامعتبر", saved:"ثبت شد", programSaved:"برنامه ذخیره شد", dayAdded:"روز اضافه شد", exerciseAdded:"تمرین اضافه شد", setAdded:"ست اضافه شد", archiveEmpty:"آرشیو خالی", addExercise:"افزودن تمرین", addSet:"افزودن ست", weight:"وزن", system:"سیستم", bodyFat:"چربی بدن"},
  en: { activeProgram:"Active Program", bodyWeight:"Current Weight", managePrograms:"Manage Programs", bodyMetrics:"Body Metrics", archive:"Archive", programs:"Programs", newProgram:"New Program", addEntry:"Add Entry", noPrograms:"No programs found", invalidValues:"Invalid values", saved:"Saved", programSaved:"Program saved", dayAdded:"Day added", exerciseAdded:"Exercise added", setAdded:"Set added", archiveEmpty:"Archive is empty", addExercise:"Add Exercise", addSet:"Add Set", weight:"Weight", system:"System", bodyFat:"Body Fat"}
};

function applyTranslations(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.dataset.i18n;
    el.innerText = translations[currentLang][key]||key;
  });
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang==="fa"?"rtl":"ltr";
}

const langBtn = document.getElementById("langToggle");
if(langBtn){
  langBtn.onclick = ()=>{
    currentLang = currentLang==="fa"?"en":"fa";
    localStorage.setItem("lang", currentLang);
    langBtn.innerText = currentLang==="fa"?"EN":"FA";
    applyTranslations();
  };
}
applyTranslations();

// ------------------ Navigation ------------------
function navigate(viewId){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  const target = document.getElementById(viewId);
  if(target) target.classList.add("active");

  if(viewId==="programs") renderPrograms();
  if(viewId==="metrics") renderMetrics();
  if(viewId==="archive") renderArchive();
}

// ------------------ Programs ------------------
function createProgram(){
  const name = prompt(currentLang==="fa"?"نام برنامه:":"Program name:");
  if(!name) return;
  const program = { name, active:true, createdAt:new Date() };
  addItem("programs", program, ()=>{
    alert(translations[currentLang].programSaved);
    renderPrograms();
    loadDashboard();
  });
}

function renderPrograms(){
  getAllItems("programs", programs=>{
    const list = document.getElementById("programList");
    const daysContainer = document.getElementById("programDaysContainer");
    if(!list||!daysContainer) return;
    list.innerHTML=""; daysContainer.innerHTML="";

    if(programs.length===0){ list.innerText = translations[currentLang].noPrograms; return; }

    programs.forEach(p=>{
      const div = document.createElement("div");
      div.className="card";
      div.innerHTML = `<strong>${p.name}</strong>
        <div style="margin-top:10px;">
          <button onclick="toggleProgram(${p.id})">${p.active?'Deactivate':'Activate'}</button>
          <button onclick="deleteProgramUI(${p.id})">Delete</button>
          <button onclick="addDayUI(${p.id})">+ ${translations[currentLang].dayAdded}</button>
        </div>`;
      list.appendChild(div);
      renderDays(p.id, daysContainer);
    });
  });
}

function toggleProgram(id){
  getAllItems("programs", programs=>{
    const p = programs.find(p=>p.id===id);
    if(!p) return;
    p.active = !p.active;
    updateItem("programs", p, ()=>{ renderPrograms(); loadDashboard(); });
  });
}

function deleteProgramUI(id){
  if(!confirm(currentLang==="fa"?"حذف شود؟":"Delete?")) return;
  deleteItem("programs", id, renderPrograms);
}

// ------------------ Days ------------------
function addDayUI(programId){
  const name = prompt(currentLang==="fa"?"نام روز:":"Day name:");
  if(!name) return;
  addItem("days",{programId,name,createdAt:new Date()},()=>{ alert(translations[currentLang].dayAdded); renderPrograms(); });
}

function renderDays(programId, container){
  getAllItems("days", days=>{
    const dayList = days.filter(d=>d.programId===programId);
    dayList.forEach(d=>{
      const div = document.createElement("div");
      div.className="card";
      div.innerHTML = `<strong>${d.name}</strong>
        <button onclick="addExerciseUI(${d.id})">+ ${translations[currentLang].addExercise}</button>
        <div id="exercises-${d.id}"></div>`;
      container.appendChild(div);
      renderExercises(d.id);
    });
  });
}

// ------------------ Exercises ------------------
function addExerciseUI(dayId){
  const name = prompt(currentLang==="fa"?"نام تمرین:":"Exercise name:");
  if(!name) return;
  const systemId = prompt(currentLang==="fa"?"سیستم تمرین:":"Enter training system id:")||"";
  addItem("exercises",{dayId,name,systemId},()=>{ alert(translations[currentLang].exerciseAdded); renderExercises(dayId); });
}

function renderExercises(dayId){
  const container = document.getElementById(`exercises-${dayId}`);
  if(!container) return;
  getAllItems("exercises", exercises=>{
    const exList = exercises.filter(e=>e.dayId===dayId);
    container.innerHTML="";
    exList.forEach(e=>{
      const div = document.createElement("div");
      div.className="card";
      div.innerHTML = `<strong>${e.name}</strong><br>
        ${translations[currentLang].system}: ${e.systemId}<br>
        <button onclick="addSetUI(${e.id})">+ ${translations[currentLang].addSet}</button>
        <div id="sets-${e.id}"></div>`;
      container.appendChild(div);
      renderSets(e.id);
    });
  });
}

// ------------------ Sets ------------------
function addSetUI(exerciseId){
  const weight = parseFloat(prompt(currentLang==="fa"?"وزن (kg)":"Weight (kg)"));
  const reps = parseInt(prompt(currentLang==="fa"?"تکرار":"Reps"),10);
  if(isNaN(weight)||isNaN(reps)) return alert(translations[currentLang].invalidValues);
  addItem("sets",{exerciseId,weight,reps},()=>{ alert(translations[currentLang].setAdded); renderExercisesByExerciseId(exerciseId); });
}

function renderSets(exerciseId){
  const container = document.getElementById(`sets-${exerciseId}`);
  if(!container) return;
  getAllItems("sets", sets=>{
    const sList = sets.filter(s=>s.exerciseId===exerciseId);
    container.innerHTML="";
    sList.forEach(s=>{
      const div = document.createElement("div");
      div.innerText = `Weight: ${s.weight} kg, Reps: ${s.reps}`;
      container.appendChild(div);
    });
  });
}

// Helper to rerender parent exercise after adding set
function renderExercisesByExerciseId(exId){
  getAllItems("exercises", exercises=>{
    const e = exercises.find(e=>e.id===exId);
    if(e) renderExercises(e.dayId);
  });
}

// ------------------ Metrics ------------------
let weightChart=null;
function addMetric(){
  const weight = parseFloat(prompt(currentLang==='fa'?'وزن (kg)':'Weight (kg)'));
  const height = parseFloat(prompt(currentLang==='fa'?'قد (cm)':'Height (cm)'));
  const bodyFat = parseFloat(prompt(currentLang==='fa'?'درصد چربی (اختیاری)':'Body fat % (optional)'))||null;
  if(isNaN(weight)||isNaN(height)) return alert(translations[currentLang].invalidValues);
  const bmi = weight / ((height/100)**2);
  addItem("metrics",{weight,height,bodyFat,bmi,date:new Date()},()=>{
    alert(translations[currentLang].saved); loadDashboard(); renderMetrics(); renderCharts();
  });
}

function renderMetrics(){
  const container = document.getElementById("metricsContent");
  if(!container) return;
  getAllItems("metrics", metrics=>{
    container.innerHTML="";
    if(metrics.length===0){ container.innerText = currentLang==='fa'?"رکوردی موجود نیست":"No metrics yet"; return; }
    metrics.slice().reverse().forEach(m=>{
      const div = document.createElement("div");
      div.className="card";
      div.innerHTML=`<strong>${new Date(m.date).toLocaleDateString()}</strong><br>
        ${translations[currentLang].weight}: ${m.weight} kg<br>
        BMI: ${m.bmi.toFixed(1)}<br>
        ${m.bodyFat!==null?translations[currentLang].bodyFat+`: ${m.bodyFat}%`:""}`;
      container.appendChild(div);
    });
  });
}

function renderCharts(){
  getAllItems("metrics", metrics=>{
    if(metrics.length===0) return;
    const ctx = document.getElementById("metricsChart")?.getContext("2d");
    if(!ctx) return;
    const labels = metrics.map(m=>new Date(m.date).toLocaleDateString());
    const weightData = metrics.map(m=>m.weight);
    const bmiData = metrics.map(m=>m.bmi.toFixed(1));
    if(weightChart) weightChart.destroy();
    weightChart = new Chart(ctx,{type:"line",data:{labels,datasets:[{label:translations[currentLang].weight,data:weightData,borderColor:"#00FF88",fill:false},{label:"BMI",data:bmiData,borderColor:"#FF00FF",fill:false}]},options:{responsive:true,plugins:{legend:{position:"top"}},scales:{y:{beginAtZero:false}}}});
  });
}

// ------------------ Dashboard ------------------
function loadDashboard(){
  getAllItems("programs", programs=>{
    const active = programs.find(p=>p.active);
    const el = document.getElementById("activeProgramName");
    if(el) el.innerText = active?active.name:"—";
  });
  getLastMetric(last=>{
    const wEl = document.getElementById("currentWeight");
    const bmiEl = document.getElementById("currentBMI");
    if(!wEl||!bmiEl) return;
    if(!last){ wEl.innerText="— kg"; bmiEl.innerText="—"; return; }
    wEl.innerText = last.weight+" kg";
    bmiEl.innerText = last.bmi.toFixed(1);
  });
}

// ------------------ Archive ------------------
function renderArchive(){
  const container = document.getElementById("archiveList");
  if(!container) return;
  getAllItems("programs", programs=>{
    container.innerHTML="";
    if(programs.length===0){ container.innerText=translations[currentLang].archiveEmpty; return; }
    programs.forEach(p=>{
      const div = document.createElement("div");
      div.className="card";
      div.innerHTML=`<strong>${p.name}</strong> - ${p.active?(currentLang==='fa'?'فعال':'Active'):(currentLang==='fa'?'غیرفعال':'Inactive')}<br>
      ${currentLang==='fa'?'ساخته شده در':'Created at'}: ${new Date(p.createdAt).toLocaleDateString()}`;
      container.appendChild(div);
    });
  });
}

// ------------------ Export ------------------
function exportData() {
  if(!db) return;

  const stores = ["programs","days","exercises","sets","metrics"];
  const exportObj = {};
  let completed = 0;

  stores.forEach(store => {
    const tx = db.transaction(store, "readonly");
    const objectStore = tx.objectStore(store);
    objectStore.getAll().onsuccess = e => {
      exportObj[store] = e.target.result;
      completed++;
      if(completed === stores.length){
        // وقتی همه داده‌ها آماده شد، فایل JSON بساز
        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "iron-vault-backup.json";
        link.click();
        URL.revokeObjectURL(link.href); // آزاد کردن URL
      }
    };
  });
}
