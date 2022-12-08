import UserRegion from './UserRegion.js';

const region = new UserRegion();

const customSelect = document.querySelector('.custom-select');
const dropdownInput = document.querySelector('.dropdown__input');

customSelect?.addEventListener('click', (e) => {
  if (e.target.classList.contains('custom-select__top')) {
    document.querySelector('.dropdown').classList.toggle('active');
    region.fetchRegionList();
  }
});

dropdownInput?.addEventListener('input', (e) => {
  if (e.target.value.length >= 1) {
    document.querySelector('.dropdown__search-icon').classList.add('visible');
  } else {
    document.querySelector('.dropdown__search-icon').classList.remove('visible');
  }
});
