let slideIndex = 0;
showSlides();

function showSlides() {
  const slides = document.getElementsByClassName("mySlides");

  // Убираем класс "active" у всех слайдов
  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active");
  }

  // Увеличиваем индекс слайда
  slideIndex++;

  // Если индекс превышает количество слайдов, сбрасываем его на 1
  if (slideIndex > slides.length) {
    slideIndex = 1;
  }

  // Добавляем класс "active" для текущего слайда
  slides[slideIndex - 1].classList.add("active");

  // Задержка перед показом следующего слайда (каждые 3.5 секунды)
  setTimeout(showSlides, 3500);
}
