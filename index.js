const autocompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster == "N/A" ? "" : movie.Poster;
    return `
      <img src = "${imgSrc}" />
      ${movie.Title}
      `;
  },

  inputValue(movie) {
    return movie.Title;
  },

  async fetchData(searchTerm) {
    const response = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: "15cb921",
        s: searchTerm,
      },
    });

    if (response.data.Error) return [];
    return response.data.Search;
  },
};

/*************************************************************************************************************** */
//LEFY_SIDE

createAutoComplete({
  ...autocompleteConfig, // please understand this very carefully why did we use the spread operator in below comments
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
});

/*
the spread operator is used as the argument because we need the contents of the object as the argument to be spread as a list of arguments and not the object is passed as the argument (if object is passed then we will require the objectPassed's object's methiods insteda of objectPassed's methods and since objectPassed is destructured in createautoComplete module it is better to pass the object's methods by spread operator instead of object itself which needs  a refactor for createautoComplete module)
*/

//RIGHT_SIDE

createAutoComplete({
  ...autocompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
});

/******************************************************************************************************************** */
let leftMovie, rightMovie;
const onMovieSelect = async (movie, sideToRender, side) => {
  const response = await axios.get("https://www.omdbapi.com/", {
    params: {
      apikey: "15cb921",
      i: movie.imdbID,
    },
  });

  sideToRender.innerHTML = movieTemplate(response.data);

  if (side == "left") leftMovie = response.data;
  else rightMovie = response.data;

  if (leftMovie && rightMovie) {
    runComparision();
  }
};

const runComparision = () => {
  const leftSideStats = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summary .notification"
  );

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    const leftSideValue = parseInt(leftStat.dataset.value);
    const rightSideValue = parseInt(rightStat.dataset.value);

    if (rightSideValue === leftSideValue) {
      return;
    } else if (isNaN(rightSideValue) && isNaN(leftSideValue)) {
      leftStat.classList.remove("is-success");
      leftStat.classList.add("is-warning");
      rightStat.classList.remove("is-success");
      rightStat.classList.add("is-warning");
    } else if (rightSideValue > leftSideValue) {
      leftStat.classList.remove("is-success");
      leftStat.classList.add("is-danger");
    } else {
      rightStat.classList.remove("is-success");
      rightStat.classList.add("is-danger");
    }
  });
};

const movieTemplate = (movieDetail) => {
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(movieDetail.Metascore);
  const imdbrating = parseFloat(movieDetail.imdbRating);
  const imdbvote = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));
  //let count = 0;
  //const awards = movieDetail.Awards.split(' ').forEach(word => {
  //const value = parseInt(word);
  //  if(isNaN(value)) {
  //    return;

  //  }
  //  else {
  //    count += value;
  //  }

  //});
  //console.log(count);

  const awards = movieDetail.Awards.split(" ").reduce((accum, currval) => {
    const value = parseInt(currval);
    if (isNaN(value)) {
      return accum;
    } else {
      return accum + value;
    }
  }, 0);
  //console.log(awards);

  //console.log(dollars, metascore, imdbrating, imdbvote);
  return `
    <article class = "media" >
      <figure class = "media-left">
        <p class = "image">
          <img src = "${movieDetail.Poster}" />
        </p>
      </figure>
      <div class = "media-content">
        <div class = "content">
            <h1>${movieDetail.Title}</h1>
            <h4>${movieDetail.Genre}</h4>
            <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>

    <article data-value = ${awards} class = "notification is-success">
      <p class = "title">${movieDetail.Awards}</p>
      <p class = "subtitle">Awards</p>
    </article>

      <article  data-value = ${dollars} class = "notification is-success">
      <p class = "title">${movieDetail.BoxOffice}</p>
      <p class = "subtitle">Box Office</p>
    </article>

    <article  data-value = ${metascore} class = "notification is-success">
      <p class = "title">${movieDetail.Metascore}</p>
      <p class = "subtitle">Metascore</p>
    </article>

    <article  data-value = ${imdbrating} class = "notification is-success">
      <p class = "title">${movieDetail.imdbRating}</p>
      <p class = "subtitle">IMDB Rating</p>
    </article>

    <article  data-value = ${imdbvote} class = "notification is-success">
      <p class = "title">${movieDetail.imdbVotes}</p>
      <p class = "subtitle">IMDB Votes</p>
    </article>
  `;
};
