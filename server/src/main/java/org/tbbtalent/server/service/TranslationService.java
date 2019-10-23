package org.tbbtalent.server.service;

import java.util.List;

import org.tbbtalent.server.model.AbstractTranslatableDomainObject;
import org.tbbtalent.server.model.Translation;
import org.tbbtalent.server.request.translation.CreateTranslationRequest;
import org.tbbtalent.server.request.translation.UpdateTranslationRequest;

public interface TranslationService {

    <T extends AbstractTranslatableDomainObject<Long>> void translate(List<T> items,  String type);

    <T extends AbstractTranslatableDomainObject<Long>> void translate(List<T> items, String type, String language);

    Translation createTranslation(CreateTranslationRequest request);

    Translation updateTranslation(long id, UpdateTranslationRequest request);
}
