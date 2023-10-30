import Option from "./Option"
import he from 'he';
import PropTypes from 'prop-types';


function Question(props) {
    /**
     * Method overloading
     * Will be passed to each option component
     * will call the App holdOption function while passing 
     * both question id and option id
     */
    function holdOption(optionId) {
        props.holdOption(props.id, optionId);
    }

    const optionElements = props.options.map(item => {
        return (
            <Option 
                key={item.id}
                option={he.decode(item.option)}
                isHeld={item.isHeld}
                isCorrect={item.isCorrect}
                isWrong={item.isWrong}

                holdOption={() => holdOption(item.id)}
                isDisabled={props.allOptionsChecked}
            />
        )
    })
    
    return (
        <div className="question">
            <h1 className="question--title">{he.decode(props.question)}</h1>
            
            <div className="options--container">
                {optionElements}
            </div>
            
            <hr className="question--line"/>
        </div>
    )
}

Question.propTypes = {
    id: PropTypes.string,
    question: PropTypes.string,
    options: PropTypes.array,
    holdOption: PropTypes.func,
    allOptionsChecked: PropTypes.bool,
}

export default Question