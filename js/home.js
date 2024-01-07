document.addEventListener('DOMContentLoaded', () => {
  let likedMoviesArray = JSON.parse(localStorage.getItem("likedMovies")) || [];
  const moviesPresentation = document.getElementById('moviesPresentation');
  const dailyId = document.getElementById('dailyId');
  const weeklyId = document.getElementById('weeklyId');
  const dailyOptions = document.getElementById('dailyOptions');
  const weeklyOptions = document.getElementById('weeklyOptions');
  const pagination = document.querySelector('.pagination');
  const totalPages = 5;
  let currentPage = 1;
  let popularity = 'day';

  function isMovieLiked(movieId) {
    return likedMoviesArray.some((movie) => movie.id === movieId);
  }

  function createMovieCard(movieResult) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    const heartIconClass = isMovieLiked(movieResult.id) ? 'fa-solid' : 'fa-regular';
    const heartIconColor = isMovieLiked(movieResult.id) ? '#ff0000' : '';

    movieCard.innerHTML = `
      <p>Title: ${movieResult.title} <i class="heart-icon ${heartIconClass} fa-heart" style="color: #ff0000;"></i></p>
      <p>Release Date: ${movieResult.release_date}</p>
      <img style="width:20%; height:auto;" src="https://image.tmdb.org/t/p/original${movieResult.poster_path}" />
    `;

    moviesPresentation.appendChild(movieCard);

    const heartIcon = movieCard.querySelector('.heart-icon');

    heartIcon.addEventListener('click', () => {
      if (heartIcon.classList.contains('fa-regular')) {
        heartIcon.classList.remove('fa-regular');
        heartIcon.classList.add('fa-solid');
        heartIcon.style.color = '#ff0000';

        const likedMovie = {
          id: movieResult.id,
          title: movieResult.title,
          poster_path: movieResult.poster_path,
        };

        likedMoviesArray.push(likedMovie);
      } else {
        heartIcon.classList.remove('fa-solid');
        heartIcon.classList.add('fa-regular');
        heartIcon.style.color = '#ff0000';

        const index = likedMoviesArray.findIndex((movie) => movie.id === movieResult.id);
        if (index !== -1) {
          likedMoviesArray.splice(index, 1);
        }
      }

      localStorage.setItem('likedMovies', JSON.stringify(likedMoviesArray));
    });
  }

  function updatePagination() {
    const pageItems = pagination.querySelectorAll('.page-item');
    pageItems.forEach((item) => item.classList.remove('active'));

    const pageLinks = pagination.querySelectorAll('.page-link');

    if (currentPage === 1) {
      pageItems[0].classList.add('disabled');
    } else {
      pageItems[0].classList.remove('disabled');
    }

    if (currentPage === totalPages) {
      pageItems[6].classList.add('disabled');
    } else {
      pageItems[6].classList.remove('disabled');
    }

    pageLinks[1].textContent = currentPage;
    pageLinks[1].parentElement.classList.add('active');
  }

  pagination.addEventListener('click', (event) => {
    const targetTagName = event.target.tagName;

    if (targetTagName === 'A' && !event.target.parentElement.classList.contains('disabled')) {
      event.preventDefault();
      const pageNumber = parseInt(event.target.textContent);

      if (pageNumber === currentPage) {
        return;
      }

      if (event.target.textContent === 'Previous') {
        currentPage--;
      } else if (event.target.textContent === 'Next') {
        currentPage++;
      } else {
        currentPage = pageNumber;
      }

      updatePagination();
      fetchMovies(currentPage, popularity);
    }
  });

  dailyId.addEventListener('click', () => {
    popularity = 'day';
    currentPage = 1;
    fetchMovies(currentPage, 'day');
    toggleOptions('daily');
  });

  weeklyId.addEventListener('click', () => {
    popularity = 'week';
    currentPage = 1;
    fetchMovies(currentPage, 'week');
    toggleOptions('weekly');
  });

  function toggleOptions(selectedOption) {
    dailyOptions.style.display = selectedOption === 'daily' ? 'block' : 'none';
    weeklyOptions.style.display = selectedOption === 'weekly' ? 'block' : 'none';
  }

  function fetchMovies(page = 1, popularity = 'day') {
    let url;

    if (popularity === 'day') {
      url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}&api_key=f673b4c51255192622a586f74ec1f251`;
    } else if (popularity === 'week') {
      if (page >= 1 && page <= 5) {
        const startPage = page + 9;
        url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${startPage}&api_key=f673b4c51255192622a586f74ec1f251`;
      } else {
        console.log('nope');
        return;
      }
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        moviesPresentation.innerHTML = '';
        data.results.forEach((movieResult) => {
          if (movieResult.poster_path !== null) {
            createMovieCard(movieResult);
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchMovies(currentPage, popularity);
});
