<?php

namespace AppBundle\Document\Repository;

use Doctrine\MongoDB\Collection;
use Doctrine\ODM\MongoDB\DocumentRepository;

abstract class AbstractBaseDocumentRepository extends DocumentRepository
{
    /**
     * @var Collection
     */
    protected $collection;

    public function setCollection(Collection $collection)
    {
        $this->collection = $collection;

        return $this;
    }
}