package com.yazzer.foot5connect.services;

import com.yazzer.foot5connect.dto.CurrentDualMatchDetailsDto;
import com.yazzer.foot5connect.dto.CurrentMatchDto;

public interface MatchService {

    CurrentMatchDto findMyCurrentMatch();

    CurrentDualMatchDetailsDto findMyCurrentDualMatchDetails();
}
