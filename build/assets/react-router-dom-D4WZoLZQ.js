import{r as e,R as T}from"./react-B5uZ1pqB.js";import"./react-dom-CFh3N_J4.js";import{l as p,R as w}from"./react-router-BcXzeK4J.js";import{c as F}from"./@remix-run-BIrGyY9Z.js";/**
 * React Router DOM v6.30.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const U="6";try{window.__reactRouterVersion=U}catch{}const E="startTransition",u=T[E];function d(t){let{basename:R,children:S,future:s,window:h}=t,i=e.useRef();i.current==null&&(i.current=F({window:h,v5Compat:!0}));let r=i.current,[n,o]=e.useState({action:r.action,location:r.location}),{v7_startTransition:a}=s||{},c=e.useCallback(l=>{a&&u?u(()=>o(l)):o(l)},[o,a]);return e.useLayoutEffect(()=>r.listen(c),[r,c]),e.useEffect(()=>p(s),[s]),e.createElement(w,{basename:R,children:S,location:n.location,navigationType:n.action,navigator:r,future:s})}var m;(function(t){t.UseScrollRestoration="useScrollRestoration",t.UseSubmit="useSubmit",t.UseSubmitFetcher="useSubmitFetcher",t.UseFetcher="useFetcher",t.useViewTransitionState="useViewTransitionState"})(m||(m={}));var f;(function(t){t.UseFetcher="useFetcher",t.UseFetchers="useFetchers",t.UseScrollRestoration="useScrollRestoration"})(f||(f={}));export{d as B};
