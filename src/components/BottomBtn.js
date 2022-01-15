import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'

const BottomBtn = ({ text, icon, btnClass, onBtnClick }) => {
  return (
    <button
      type="button"
      className={`btn no-border container-fluid rounded-0 ${btnClass}`}
      onClick={ onBtnClick }
    >
      <FontAwesomeIcon
        className='me-2'
        icon={ icon }
      />
      { text }
    </button>
  )
}

BottomBtn.propTypes = {
  text: PropTypes.string,
  btnClass: PropTypes.string,
  icon: PropTypes.object,
  onBtnClick: PropTypes.func
}

BottomBtn.defaultProps = {
  text: '新建'
}

export default BottomBtn