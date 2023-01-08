
function* generatorUID(seed = 0) {
	let shouldEscape = false;
	while(true) {
		shouldEscape = yield shouldEscape ? seed : ++seed;
	}
}

const rpc = generatorUID();

export default function Card({ date, mood, emoji, classNames = "" }) {
    // Needs <li> wrapper to maintain Splide a11y
    const { value: i } = rpc.next();

    return `<li class="${classNames}" data-date=${date}>
        <div class="card" data-emoji="${emoji}" data-mood="${mood}">
            <div class="h1 card-emoji" aria-labelledby="cardTitle_${i}">
                <div>${emoji}</div>
                <div class="shadow"></div>
            </div>
            <h3 class="card-title" id="cardTitle_${i}">${date ? date + ' - ' : ''}${mood}</h3>
        </div>
    </li>`
}