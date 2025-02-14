/*
 * Copyright (c) 2021 Talent Beyond Boundaries.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

package org.tbbtalent.server.api.admin;

import java.security.GeneralSecurityException;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClientException;
import org.tbbtalent.server.model.sf.Opportunity;
import org.tbbtalent.server.request.opportunity.UpdateEmployerOpportunityRequest;
import org.tbbtalent.server.service.db.SalesforceService;
import org.tbbtalent.server.service.db.impl.SalesforceServiceImpl;
import org.tbbtalent.server.util.dto.DtoBuilder;

@RestController()
@RequestMapping("/api/admin/sf")
public class SalesforceAdminApi {
  private final SalesforceService salesforceService;

  @Autowired
  public SalesforceAdminApi(SalesforceService salesforceService) {
    this.salesforceService = salesforceService;
  }

  /**
   * Returns info (including "name") about the Salesforce opportunity corresponding to the given 
   * url - or null if the url does not refer to a Salesforce opportunity.
   * <p/>
   * Note that the url is passed as request param - it is not possible to pass another url in the 
   * request url itself.
   * @param sfUrl Link to salesforce opportunity
   * @return Map containing "name" attribute and other opportunity attributes (as defined in the 
   * dto), or null if not an opportunity.
   * @throws GeneralSecurityException If there are errors relating to keys and digital signing.
   * @throws WebClientException if there is a problem connecting to Salesforce
   */
  @GetMapping("opportunity")
  @Nullable
  public Map<String, Object> getOpportunity(@RequestParam(value = "url") String sfUrl)
      throws GeneralSecurityException, WebClientException {

    Opportunity opp = null;

    //Make sure that it is referring to a Salesforce Opportunity record
    String objectType = SalesforceServiceImpl.extractObjectTypeFromSfUrl(sfUrl);
    if ("Opportunity".equals(objectType)) {
      String sfId = SalesforceServiceImpl.extractIdFromSfUrl(sfUrl);
      if (sfId != null) {
        opp = salesforceService.findOpportunity(sfId);
      }
    }
    return opportunityDto().build(opp);
  }

  @PutMapping("update-emp-opp")
  public void updateEmployerOpportunity(@RequestBody UpdateEmployerOpportunityRequest request)
      throws GeneralSecurityException {
    salesforceService.updateEmployerOpportunity(request);
  }
  
  private DtoBuilder opportunityDto() {
    return new DtoBuilder()
        .add("name")
        ;
  }
  
}
