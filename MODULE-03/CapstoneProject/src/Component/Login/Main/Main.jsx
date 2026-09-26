import './Main.css'
import UpperMain from './UpperMain/UpperMain'
import LowerMain from './LowerMain/LowerMain'
import { useParams } from 'react-router-dom'
function Main() {
  const id = useParams()

  console.log("id is ", id)

  return (
    <div className='account-main'>
      <UpperMain/>
      <LowerMain/>
    </div>
  )
}

export default Main