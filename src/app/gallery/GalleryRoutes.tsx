import { Route, Routes } from 'react-router-dom'
import { Gallery } from './Gallery'
import { QuizMultiDemo } from './QuizMultiDemo'
import { QuizSingleDemo } from './QuizSingleDemo'

/** Everything under /__gallery. Loaded lazily and only registered in dev builds (see routes.tsx). */
export default function GalleryRoutes() {
  return (
    <Routes>
      <Route index element={<Gallery />} />
      <Route path="quiz-single" element={<QuizSingleDemo />} />
      <Route path="quiz-multi" element={<QuizMultiDemo />} />
    </Routes>
  )
}
