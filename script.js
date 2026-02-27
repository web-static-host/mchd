// 1. Функция поиска с динамической иконкой (лупа/крестик)
function filterServices() {
    const input = document.getElementById('srv-search');
    const query = input.value.toLowerCase();
    const options = document.querySelectorAll('#services-list .option');
    const iconContainer = document.getElementById('search-icon-container');

    // Переключаем класс для смены иконок
    if (query.length > 0) {
        iconContainer.classList.add('active-clear');
    } else {
        iconContainer.classList.remove('active-clear');
    }
    
    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(query) ? "flex" : "none";
    });
}

function clearSearch() {
    const input = document.getElementById('srv-search');
    if (input.value.length > 0) {
        input.value = "";
        input.focus();
        filterServices(); 
    }
}

// 2. Слушатель событий: перемещение для шага 1 и подсветка для шага 2
document.addEventListener('change', function(e) {
    if (e.target.tagName === 'INPUT' && e.target.closest('.option')) {
        const label = e.target.closest('.option');
        const parent = label.parentElement;

        // Шаг 1: Сервисы (две колонки)
        if (parent.id === 'services-list' || parent.id === 'selected-list') {
            const leftBox = document.getElementById('services-list');
            const rightBox = document.getElementById('selected-list');

            if (e.target.checked) {
                label.classList.add('checked');
                rightBox.appendChild(label); // В конец правой колонки
            } else {
                label.classList.remove('checked');
                leftBox.appendChild(label);  // Назад в левую
                sortLeftList();              // Сортируем по алфавиту
            }
        } 
        // Шаг 2: Направления (старая логика подсветки)
        else {
            if (e.target.checked) {
                label.classList.add('checked');
            } else {
                label.classList.remove('checked');
            }
        }
    }
});

// Вспомогательная функция: сортировка левого списка
function sortLeftList() {
    const container = document.getElementById('services-list');
    const items = Array.from(container.querySelectorAll('.option'));
    
    items.sort((a, b) => {
        return a.textContent.trim().localeCompare(b.textContent.trim());
    });
    
    items.forEach(item => container.appendChild(item));
}

// 3. Переход между шагами
function goNext() {
    if (document.getElementById('srv-1c').checked || document.getElementById('srv-astral').checked) {
        document.getElementById('step-1').classList.remove('active');
        document.getElementById('step-2').classList.add('active');
    } else {
        calculate();
    }
}

// 4. Основной расчет
function calculate() {
    const s = {
        c1: document.getElementById('srv-1c').checked,
        astral: document.getElementById('srv-astral').checked,
        doki: document.getElementById('srv-doki').checked,
        edo: document.getElementById('srv-edo').checked,
        cz: document.getElementById('srv-cz').checked,
        egais: document.getElementById('srv-egais').checked,
        t44: document.getElementById('srv-t44').checked,
        t223: document.getElementById('srv-t223').checked,
        newClass: Array.from(document.querySelectorAll('.srv-new-class:checked')).map(i => i.getAttribute('data-name'))
    };

    const d = {
        f003: Array.from(document.querySelectorAll('.dir-003:checked')).map(i => i.getAttribute('data-name')),
        sfr: document.getElementById('dir-sfr').checked
    };

    let total = 0;
    let resLines = [];
    
    let mainMethod = (s.c1 || (s.edo && (s.cz || s.newClass.length > 0))) ? "1С:Отчетность" : "Астрал Доверенность";

    if (s.t44) {
        total++;
        resLines.push(`• <b>1 МЧД — Формат ЕИС</b> для: Торги по 44-ФЗ (ЕИС).<br>Делается через: <span class="method">Личный кабинет ЕИС</span>`);
    }

    if (d.sfr) {
        total++;
        resLines.push(`• <b>1 МЧД — Формат СФР</b> для: СФР.<br>Делается через: <span class="method">${mainMethod}</span>`);
    }

    let freeList = [];
    if (s.t223) freeList.push("Торги по 223-ФЗ");
    if (s.t223 && s.doki) freeList.push("Доки");
    
    let edoOnly = s.edo && !s.c1 && !s.astral && !s.cz && !s.egais && !s.doki && d.f003.length === 0 && s.newClass.length === 0;
    let edoInFree = (s.edo && s.t223) || edoOnly;
    if (edoInFree) freeList.push("1С:ЭДО");

    if (freeList.length > 0) {
        total++;
        let freeMethod = mainMethod;
        if (freeList.length === 1 && freeList[0] === "1С:ЭДО" && !s.c1 && !s.astral && !s.cz && s.newClass.length === 0) {
            freeMethod = "1С-ЭДО";
        }
        resLines.push(`• <b>1 МЧД — Формат 003 (полномочия в свободной форме)</b> для: ${freeList.join(", ")}.<br>Делается через: <span class="method">${freeMethod}</span>`);
    }

    let classList = [...d.f003];
    if (s.newClass.length > 0) classList.push(...s.newClass);
    if (s.cz) classList.push("Честный знак");
    if (s.egais) classList.push("ЕГАИС");
    if (s.doki && !s.t223) classList.push("Доки");
    if (s.edo && !edoInFree) classList.push("1С:ЭДО");

    if (classList.length > 0) {
        total++;
        resLines.push(`• <b>1 МЧД — Формат 003 (полномочия из классификатора)</b> для: ${classList.join(", ")}.<br>Делается через: <span class="method">${mainMethod}</span>`);
    }

    document.getElementById('total').innerText = total;
    document.getElementById('details').innerHTML = resLines.join("<br><br>");
    document.querySelectorAll('.step').forEach(st => st.classList.remove('active'));
    document.getElementById('step-3').classList.add('active');
}