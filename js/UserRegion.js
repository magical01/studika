export default class UserRegion {
  constructor() {
    // настройки
    this._useCache = true;
    this._localStorageRegion = 'user-region';
    this._localStorageBookmarks = 'user-region-bookmarks';
    this._cssClassNameHidden = 'visually-hidden';

    this._preloaderElement = document.querySelector('.lds-ellipsis');
    this._selectedRegionElement = document.querySelector('.custom-select__text');
    this._bookmarksElement = document.querySelector('.dropdown__selected');
    this._regionListElement = document.querySelector('.custom-select__dropdown ul');
    this._inputField = document.querySelector('.dropdown__search .dropdown__input');
    this._inputEraser = document.querySelector('.dropdown__search .dropdown__search-icon');
    this._saveRegionBtn = document.querySelector('.dropdown__save');

    this._api = 'https://studika.ru/api/areas';

    // сохранить регион пользователя
    this._saveRegionBtn.addEventListener('click', () => {
      this.saveUserRegion();
    });
    // ввод текста
    this._inputField.addEventListener('input', () => {
      this.renderRegionList();
    });
    // сброс текста
    this._inputEraser.addEventListener('click', () => {
      this.resetSearchField();
      this.renderRegionList();
      this.hideIcon();
    });

    // main
    this._regionDataCached = [];

    this.showPreloader();
    this.loadRegion();
    this.loadRegionBookmarks();
    this.renderRegionBookmarks();
  }

  /**
   * Отображает элемент с сохраненными городами, скрывает прелоадер.
   */
  showPreloader() {
    this._bookmarksElement.classList.add(this._cssClassNameHidden);
    this._preloaderElement.classList.remove(this._cssClassNameHidden);
  }

  /**
   * Отображает прелоадер, скрывает элемент с сохраненными городами.
   */
  hidePreloader() {
    this._bookmarksElement.classList.remove(this._cssClassNameHidden);
    this._preloaderElement.classList.add(this._cssClassNameHidden);
  }

  /**
   * Очищает строку поиска
   */
  resetSearchField() {
    this._inputField.value = '';
  }

  hideIcon() {
    this._inputEraser.classList.remove('visible');
  }


  /**
   * Сохраняет обьект с городом/регионом в переменную и в localStorage.
   *
   * @param {object} region Выбранный регион.
   */
  addRegionToBookmarks(region) {
    this._bookmarks.push(region);
    this.saveRegionBookmarks();
    this.renderRegionBookmarks();
  }

  /**
   * Удаляет регион из переменной
   *
   * @param {object} region Регион.
   */
  removeRegionFromBookmarks(region) {
    // поиск элемента массива с нужным id
    const isCity = region.hasOwnProperty('state_id');
    let removeIndex = -1;
    for (let [index, item] of this._bookmarks.entries()) {
      // это город, искать по id города и id области
      if (isCity) {
        if (item.id == region.id && item?.state_id == region.state_id) {
          removeIndex = index;
          break;
        }
      }
      // это область, искать только по id
      else {
        if (item.id == region.id) {
          removeIndex = index;
          break;
        }
      }
    }
    // элемент массива найден
    if (removeIndex >= 0) {
      this._bookmarks.splice(removeIndex, 1);
    }
    this.saveRegionBookmarks();
    this.renderRegionBookmarks();
  }

  /**
   * Сохраняет отмеченные регионы/города в localStorage.
   */
  saveRegionBookmarks() {
    let bookmarksStr = JSON.stringify(this._bookmarks);
    localStorage.setItem(this._localStorageBookmarks, bookmarksStr);
  }

  /**
   * Загружает сохраненные регионы/города из localStorage в переменную.
   */
  loadRegionBookmarks() {
    let itemValue = localStorage.getItem(this._localStorageBookmarks);
    let bookmarks = [];
    if (itemValue !== null) {
      try {
        bookmarks = JSON.parse(itemValue);
      } catch (err) {
        localStorage.removeItem(this._localStorageBookmarks);
      }
    }
    this._bookmarks = bookmarks;
  }

  /**
   *  Возвращает HTML код одного элемента (город) из списка сохраненных городов.
   *
   * @param {string} name Название региона.
   * @param {number} dataId data-id региона из списка.
   *
   * @return {string} HTML код элемента.
   */
  getRegionBookmarksItemHTML(name, dataId, stateId) {
    return `
      <div class="dropdown__selected-city" role="button" data-id="${dataId}">
        ${name}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" >
          <path
            d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
            fill="white"
          />
        </svg>
      </div>
    `;
  }

  /**
   * Перерисовывает на странице список сохраненных в переменной регионов/городов. Создает события при клике.
   */
  renderRegionBookmarks() {
    let html = '';
    for (let item of this._bookmarks) {
      const isCity = item.hasOwnProperty('state_id');
      const dataId = isCity ? String(item.state_id) + '__' + String(item.id): String(item.id);
      html += this.getRegionBookmarksItemHTML(item.name, dataId);
      setTimeout(() => {
        document.querySelector(`.dropdown__selected-city[data-id="${dataId}"] svg`).addEventListener('click', () => {
            this.removeRegionFromBookmarks(item);
          });
      }, 10);
    }
    this._bookmarksElement.innerHTML = html;
  }


  /**
   * Возвращает город/регион по умолчанию.
   *
   * @return {object} Регион по умолчанию.
   */
  getDefaultRegion() {
    return { name: 'Любой город', id: -1, type: 'default' };
  }

  /**
   * Загружает сохраненный город/регион из localStorage, отображает его в шапке.
   */
  loadRegion() {
    let strData = localStorage.getItem(this._localStorageRegion);
    let item = this.getDefaultRegion();
    if (strData !== null) {
      try {
        item = JSON.parse(strData);
      } catch (err) {
        localStorage.removeItem(this._localStorageRegion);
      }
    }
    this._selectedRegionElement.textContent = item.name;
  }

  /**
   * Сохраняет город/регион пользователя в localStorage.
   *
   * @param {object} region Регион/город
   */
  saveRegion(region) {
    const jsonData = JSON.stringify(region);
    localStorage.setItem(this._localStorageRegion, jsonData);
  }

  /**
   * Берет последний регион из списка сохраненных и сохраняет его как регион пользователя.
   */
  saveUserRegion() {
    let lastRegion = [...this._bookmarks].pop();
    this.saveRegion(lastRegion);
    this.showPreloader();
    setTimeout(() => {
      document.location.reload(true);
    }, 500);
  }

  /**
   * Создает событие при клике на город из списка регионов и городов.
   *
   * @param {object} item Регион.
   * @param {string} dataId data-id элемента.
   */
  selectRegionAddEvent(item, dataId) {
    setTimeout(() => {
      const $element = document.querySelector(`.dropdown__item[data-id="${dataId}"]`);
      if ($element) {
        $element.addEventListener('click', () => {
          this.addRegionToBookmarks(item);
        });
      }
    }, 100);
  }

  /**
   *  Возвращает HTML код одного элемента (регион) из списка городов.
   *
   * @param {string} regionName Название региона.
   * @param {string} dataId data-id элемента.
   *
   * @return {string} HTML код элемента.
   */
  getRegionElementHTML(regionName, dataId) {
    return `
      <li class="dropdown__item">${regionName}</li>
    `;
  }

  /**
   *  Возвращает HTML код одного элемента (город) из списка городов.
   *
   * @param {string} cityName Название города.
   * @param {string} regionName Название региона.
   * @param {string} dataId data-id элемента.
   *
   * @return {string} HTML код элемента.
   */
  getCityElementHTML(cityName, regionName, dataId) {
    return `
      <li class="dropdown__item" data-id="${dataId}">${cityName}
        <span class="dropdown__item-region">${regionName}</span>
      </li>
    `;
  }

  /**
   * Проверяет, содержит ли строка заданную подстроку.
   *
   * @param {string} str Целевая строка.
   * @param {string} substr Строка для поиска.
   *
   * @return {object} возвращает объект с полями formattedString (string, форматированная строка) и isIncludes (boolean, 'true' если строка содержит указанную подстроку)
   */
  formatStr(str, substr) {
    if (substr.length == 0) {
      return {
        formattedString: str,
        isIncludes: true,
      };
    }
    let idx = str.toLowerCase().indexOf(substr.trim().toLowerCase());
    if (idx < 0) {
      return {
        formattedString: str,
        isIncludes: false,
      };
    } else {
      const end = idx + substr.trim().length;
      return {
        formattedString:
          str.substring(0, idx) +
          '<b>' +
          str.substring(idx, end) +
          '</b>' +
          str.substring(end, str.length),
        isIncludes: true,
      };
    }
  }

  /**
   *  Вставляет HTML код списка городов. Создает обработчики события click по созданным элементам.
   *
   * @param {object} items Массив обьектов полученных с API. (опционально)
   */
  renderRegionList(items) {
    if (typeof items == 'undefined') items = this._regionDataCached;
    let searchQuery = this._inputField.value;
    let html = '';
    for (let item of items) {
      if (item.type == 'area') {
        // добавить регион
        let { formattedString, isIncludes } = this.formatStr(item.name, searchQuery);
        // содержит подстроку? добавляем!
        if (isIncludes) {
          html += this.getRegionElementHTML(formattedString, item.id);
          this.selectRegionAddEvent(item, item.id);
        }
        // добавить города
        for (let city of item.cities) {
          let { formattedString, isIncludes } = this.formatStr(city.name, searchQuery);
          // содержит подстроку? еще добавляем!
          if (isIncludes) {
            html += this.getCityElementHTML(formattedString, item.name, String(city.state_id) + '_' + String(city.id));
            this.selectRegionAddEvent(city, String(city.state_id) + '_' + String(city.id));
          }
        }
      }
    }
    this._regionListElement.innerHTML = html;
  }

  /**
   *  Получает список регионов с API и сохраняет результат в переменную.
   */
  fetchRegionList() {
    if (this._useCache === true && this._regionDataCached.length > 0) {
      this.renderRegionList();
      return;
    }
    this.showPreloader();
    fetch(this._api, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((jsonData) => {
        this.hidePreloader();
        this._regionDataCached = jsonData;
        this.renderRegionList();
      });
  }
}
