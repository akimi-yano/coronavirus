(this.webpackJsonpcoronavirus=this.webpackJsonpcoronavirus||[]).push([[0],{28:function(e,t,n){e.exports=n(57)},33:function(e,t,n){},51:function(e,t,n){},57:function(e,t,n){"use strict";n.r(t);var a=n(0),c=n.n(a),o=n(24),r=n.n(o),i=(n(33),n(25)),l=n(6),u=n(9),s=n(11),m=n.n(s),p=function(){var e=Object(a.useState)(),t=Object(u.a)(e,2),n=t[0],o=t[1],r=Object(a.useState)(),i=Object(u.a)(r,2),l=i[0],s=i[1],p=Object(a.useState)(),f=Object(u.a)(p,2),d=f[0],v=f[1],E=Object(a.useState)(),h=Object(u.a)(E,2),g=h[0],b=h[1];Object(a.useEffect)((function(){m.a.get("https://coronavirus-kaggle.azurewebsites.net/api/locations").then((function(e){o(e.data)})).catch((function(e){return console.log(e)}))}),[]);return c.a.createElement("div",null,c.a.createElement("p",null,"choose a country to predict"),"Current country: ",l,c.a.createElement("form",{onSubmit:function(e){e.preventDefault(),m.a.get("https://coronavirus-kaggle.azurewebsites.net/api/predictAll"+"?country=".concat(l)+(d?"&province=".concat(d):"")).then((function(e){b(e.data)})).catch((function(e){return console.log(e)}))}},null!=n?c.a.createElement("div",null,c.a.createElement("select",{name:"country",onChange:function(e){s(e.target.value),v(null)}},"(",c.a.createElement("option",{value:""},"--select a country--"),")",n.countries.map((function(e,t){return c.a.createElement("option",{value:e.name},e.name)}))),null!=l&&n.countries.find((function(e){return e.name==l})).provinces.length>0?c.a.createElement("div",null,c.a.createElement("select",{name:"province",onChange:function(e){return v(e.target.value)}},"(",c.a.createElement("option",{value:""},"--select a province--"),")",n.countries.find((function(e){return e.name==l})).provinces.map((function(e,t){return c.a.createElement("option",{value:e.name},e.name)})))):""):"",c.a.createElement("button",{type:"submit"},"Predict")),g?g.predictions.map((function(e,t){return c.a.createElement("div",null,c.a.createElement("p",null,"Predicted Confirmed Cases: ",e.confirmed),c.a.createElement("p",null,"Predicted Fatalities: ",e.fatalities))})):"")};n(51);var f=function(){return c.a.createElement(i.a,{basename:"/"},c.a.createElement("div",null,c.a.createElement(l.a,{exact:!0,path:"/",component:p}),c.a.createElement(l.a,{path:"/prediction",component:p})))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(c.a.createElement(c.a.StrictMode,null,c.a.createElement(f,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[28,1,2]]]);
//# sourceMappingURL=main.1812acdc.chunk.js.map