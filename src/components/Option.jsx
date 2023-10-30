import PropTypes from 'prop-types';

function Option(props) {
    console.log(props)

    let classNameOption
    if (props.isCorrect) {
        classNameOption = "option--correct"
    } else if (props.isWrong) {
        classNameOption = "option--incorrect"
    } else {
        classNameOption = "option"
    }

    let styles
    if (props.isDisabled) {
        styles = {
            backgroundColor: "#16161D"
        }
    } else {
        styles = {
            backgroundColor: props.isHeld ? "#91A3DC" : "#16161D",
            cursor: "pointer"
        }
    }

    return (
        <div 
            className={classNameOption}
            style={styles}
            onClick={props.isDisabled ? null : props.holdOption}
        >
            {props.option}
        </div>
    )
}

Option.propTypes = {
    isHeld: PropTypes.bool,
    isCorrect: PropTypes.bool,
    isWrong: PropTypes.bool,
    option: PropTypes.string,
    holdOption: PropTypes.func,
    isDisabled: PropTypes.bool,
}

export default Option