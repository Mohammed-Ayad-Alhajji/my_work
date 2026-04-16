document.addEventListener("DOMContentLoaded", function () {
  // تحديد الحاويات الرئيسية في الصفحة
  const mainSection = document.querySelector(".major_currencies");
  const subSection = document.querySelector(".subcurrencies");

  // تحديد حاوية الفورم في صفحة التعديل
  const formPageContainer = document.querySelector(".form_container form");

  // ==========================================
  // 1. منطق الصفحة الرئيسية (عرض العملات)
  // ==========================================
  if (mainSection || subSection) {
    // التحديث عند تحميل الصفحة
    updateMainPageUI();

    // الاستماع للتغييرات القادمة من صفحة التعديل (التحديث التلقائي)
    window.addEventListener("storage", function (event) {
      if (event.key === "allCurrencyData") {
        console.log("تم اكتشاف تعديل.. جاري التحديث");
        updateMainPageUI();
      }
    });
  }

  // ==========================================
  // 2. منطق صفحة التعديل (الفورم)
  // ==========================================
  if (formPageContainer) {
    // جلب البيانات المخزنة
    const storedData = localStorage.getItem("allCurrencyData");

    if (storedData) {
      const data = JSON.parse(storedData);
      generateForm(data, formPageContainer);
    } else {
      formPageContainer.innerHTML =
        "<p>لا توجد بيانات. يرجى فتح الصفحة الرئيسية أولاً.</p>";
    }
  }
});

// ---------------------------------------------------------
//  الوظائف المساعدة (Helper Functions)
// ---------------------------------------------------------

// --- دالة: تحديث واجهة الصفحة الرئيسية ---
function updateMainPageUI() {
  let data = JSON.parse(localStorage.getItem("allCurrencyData"));

  // إذا لم توجد بيانات، نستخرجها من HTML ونحفظها
  if (!data) {
    data = extractAllDataFromDOM();
    localStorage.setItem("allCurrencyData", JSON.stringify(data));
  }

  // 1. تحديث العملات الرئيسية (الكروت)
  const majorContainers = document.querySelectorAll(
    ".major_currencies .container"
  );
  majorContainers.forEach((container, index) => {
    if (data.major[index]) {
      container.querySelector(".buying").textContent = data.major[index].buying;
      container.querySelector(".sale").textContent = data.major[index].sale;
    }
  });

  // 2. تحديث العملات الفرعية (الجداول)
  // نحدد جميع الصفوف في كل الجداول
  const subRows = document.querySelectorAll(".subcurrencies table tr");
  let dataIndex = 0; // عداد للبيانات

  subRows.forEach((row) => {
    // نتأكد أن السطر يحتوي على بيانات (ليس سطر عناوين)
    const buyingEl = row.querySelector(".buying");
    const saleEl = row.querySelector(".sale");

    if (buyingEl && saleEl && data.sub[dataIndex]) {
      buyingEl.textContent = data.sub[dataIndex].buying;
      saleEl.textContent = data.sub[dataIndex].sale;
      dataIndex++; // ننتقل للعنصر التالي في البيانات
    }
  });
}

// --- دالة: استخراج كل البيانات من HTML (لأول مرة) ---
function extractAllDataFromDOM() {
  const data = {
    major: [],
    sub: [],
  };

  // 1. استخراج الرئيسية
  const majorContainers = document.querySelectorAll(
    ".major_currencies .container"
  );
  majorContainers.forEach((container) => {
    data.major.push({
      name: container.querySelector(".contain_heder p").textContent.trim(),
      buying: container.querySelector(".buying").textContent.trim(),
      sale: container.querySelector(".sale").textContent.trim(),
    });
  });

  // 2. استخراج الفرعية (من الجداول)
  const subRows = document.querySelectorAll(".subcurrencies table tr");
  subRows.forEach((row) => {
    // التحقق من أن السطر يحتوي على price class لتجاهل العناوين
    const buyingEl = row.querySelector(".buying");
    const saleEl = row.querySelector(".sale");

    if (buyingEl && saleEl) {
      // الاسم موجود في الخلية الثالثة (index 2) حسب ترتيب HTML الخاص بك
      // الترتيب في الـ HTML: بيع (0) - شراء (1) - العملة (2)
      const nameEl = row.children[2];

      data.sub.push({
        name: nameEl ? nameEl.textContent.trim() : "غير معروف",
        buying: buyingEl.textContent.trim(),
        sale: saleEl.textContent.trim(),
      });
    }
  });

  return data;
}

// --- دالة: توليد الفورم في الصفحة الثانية ---
function generateForm(data, formElement) {
  formElement.innerHTML = ""; // تنظيف

  // دالة مساعدة لرسم الحقول
  const createInputs = (list, title, typePrefix) => {
    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = title;
    sectionTitle.style.borderBottom = "2px solid #444";
    sectionTitle.style.paddingTop = "15px";
    formElement.appendChild(sectionTitle);

    list.forEach((currency, index) => {
      const wrapper = document.createElement("div");
      wrapper.style.padding = "10px";

      wrapper.innerHTML = `
                <strong class = "currency_name">${currency.name}</strong>
                <div class= "container_my_many">
                    <div>
                    <input type="text" id="${typePrefix}_buy_${index}" value="${currency.buying}">
                    <label> :شراء</label>
                    </div>
                    <div>
                    <input type="text" id="${typePrefix}_sale_${index}" value="${currency.sale}">
                    <label"> :مبيع</label>
                    </div>
                </div>
            `;
      formElement.appendChild(wrapper);
    });
  };

  // رسم القسمين
  if (data.major.length > 0)
    createInputs(data.major, "العملات الرئيسية", "major");
  if (data.sub.length > 0) createInputs(data.sub, "باقي العملات", "sub");

  // زر الحفظ
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "حفظ وتحديث الأسعار";
  saveBtn.type = "button";
  saveBtn.className = "save-btn"; // يمكنك تنسيقه في CSS

  saveBtn.addEventListener("click", () => {
    // تجميع البيانات الجديدة
    const newData = { major: [], sub: [] };

    // تحديث الرئيسية
    data.major.forEach((curr, index) => {
      newData.major.push({
        name: curr.name,
        buying: document.getElementById(`major_buy_${index}`).value,
        sale: document.getElementById(`major_sale_${index}`).value,
      });
    });

    // تحديث الفرعية
    data.sub.forEach((curr, index) => {
      newData.sub.push({
        name: curr.name,
        buying: document.getElementById(`sub_buy_${index}`).value,
        sale: document.getElementById(`sub_sale_${index}`).value,
      });
    });

    // الحفظ
    localStorage.setItem("allCurrencyData", JSON.stringify(newData));
    alert("تم تحديث جميع الأسعار بنجاح!");
  });

  formElement.appendChild(saveBtn);
}
