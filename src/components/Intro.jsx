import PropTypes from 'prop-types';

function Intro(props) {
    return (
        <div className="intro">
            <h1 className="intro--title">Quizzical</h1>
            <p className="intro--description">
                Where knowledge meets entertainment in the ultimate brain-teasing game!
            </p>

            <button 
                className="intro--button"
                onClick={props.handleGameStart}
            >
                Start Quiz
            </button>
        </div>
    )
    
}

Intro.propTypes = {
    handleGameStart: PropTypes.func
}

export default Intro;