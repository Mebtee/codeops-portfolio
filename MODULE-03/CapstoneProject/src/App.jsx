import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

const TodaySpecial = lazy(
  () => import('./Component/TodaySpecial/TodaySpecial')
);

const RoyalDish = lazy(() => import('./Component/RoyalDish/RoyalDish'));
const FullMenu = lazy(() => import('./Component/FullMenu/FullMenu'));
const CurrentOrderCart = lazy(
  () => import('./Component/CurrentOrderCart/CurrentOrderCart')
);
const CheckoutDelivery = lazy(
  () => import('./Component/CheckoutDelivery/CheckoutDelivery')
);
const Login = lazy(() => import('./Component/Login/Login'));
const Signup = lazy(() => import('./Component/Signup/Signup'));
const NotFound404 = lazy(() => import('./Component/NotFound404/NotFound404'));

function PageLoader() {
  return <div className="loading-state">Loading Mesob House...</div>;
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<TodaySpecial />} />
              <Route path="signup" element={<Signup />} />
              <Route path="login" element={<Login />} />
              <Route path="menu" element={<FullMenu />} />
              <Route path="/menu/:id" element={<RoyalDish />} />{' '}
              <Route path="future" element={<TodaySpecial />} />
              <Route path="orderCart" element={<CurrentOrderCart />} />
              <Route path="delivery" element={<CheckoutDelivery />} />
              <Route
                path="Delibery"
                element={<Navigate to="/delivery" replace />}
              />
              <Route path="*" element={<NotFound404 />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
