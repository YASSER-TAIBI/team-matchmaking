package com.yazzer.foot5connect.services;

import com.yazzer.foot5connect.dto.CurrentDualMatchDetailsDto;
import com.yazzer.foot5connect.dto.CurrentMatchDto;
import com.yazzer.foot5connect.dto.FinishCurrentDualMatchRequest;

public interface MatchService {

    CurrentMatchDto findMyCurrentMatch();

    CurrentDualMatchDetailsDto findMyCurrentDualMatchDetails();

    CurrentDualMatchDetailsDto confirmCurrentDualMatchCancellation(boolean confirmed);

    void finishCurrentDualMatch(FinishCurrentDualMatchRequest request);
}
