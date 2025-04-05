let slideIndex = 0;
showSlides();

function showSlides() {
  let i;
  const slides = document.getElementsByClassName("mySlides");
  for (i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active"); // Убираем класс активного слайда
  }
  slideIndex++;
  if (slideIndex > slides.length) { slideIndex = 1 } // Если индекс превышает длину массива, сбрасываем его
  slides[slideIndex - 1].classList.add("active"); // Присваиваем класс активному слайду

  // Задержка перед показом следующего слайда
  setTimeout(showSlides, 3500); // Меняем изображение каждые 5 секунд
}
