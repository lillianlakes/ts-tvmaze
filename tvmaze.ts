import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const BASE_URL = `https://api.tvmaze.com`;


interface Show {
  id: number;
  name: string;
  summary: string;
  image?: string;
}

/** getShowsByTerm: given search term, gets shows from API and returns in array
 *  if show does not have an image, defauts to "https://tinyurl.com/tv-missing"
 * 
 *    accepts: string
 *    returns: [{id, name, summary, image}, {id, name, summary, image}, ...]
 * 
 */

async function getShowsByTerm(term: string): Promise<Show[]> {
  const url = `${BASE_URL}/search/shows?q=${term}`;
  const res = await axios.get(url);
  return res.data.map((r: any) => 
    ({
      id: r.show.id, 
      name: r.show.name, 
      summary: r.show.summary, 
      image: r.show.image ? r.show.image.medium : `https://tinyurl.com/tv-missing`
    }));
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Show[]) {

  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term: string = ($("#searchForm-term").val() as string);
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

interface Episode{
  id: number;
  name: string;
  season: string;
  number: string;
}

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id: number): Promise<Episode[]> {
  const resp = await axios.get(`${BASE_URL}/shows/${id}/episodes`);
  return resp.data.map((r: any) => ({
    id: r.id,
    name: r.name,
    season: r.season,
    number: r.number,
  }))
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes: Episode[]): void { 

  const $episodesList = $("#episodesList")
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(
        `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>
      `);

    $episodesList.append($episode);  
  }
  
  $episodesArea.show();
}

$showsList.on("click", "button", async function (evt: JQuery.ClickEvent) {
  evt.preventDefault();
  const showId: string = ($(evt.target).closest("div[data-show-id]").attr("data-show-id") as string);
  const episodes = await getEpisodesOfShow(+showId);
  populateEpisodes(episodes);
})