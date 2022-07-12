import axios from 'axios';
import { useState } from 'react';

function Comic(props) {
    console.log("alanis")
    console.log(props)
    const comic = props.comic;
    if (comic) {
        return (
            <div>
                {comic.series} Vol. {comic.volume} #{comic.issue_number}
                <img src={"http://localhost:2814"+comic.thumbnail} width="300"/>
            </div>
        )
    } else {
        <div>
            No luck
        </div>
    }
}

export default Comic;