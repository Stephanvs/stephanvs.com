import React from "react";
import "./avatar.css";
import me from './stephanvs.png';

export default function Avatar() {
  return (
    <img src={me} className="profile_picture center" alt="stephanvs"></img>
  )
}