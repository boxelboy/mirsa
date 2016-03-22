<?php
namespace Computech\Bundle\CommonBundle\Controller;

use Doctrine\ORM\Query\ResultSetMapping;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * AbstractRestController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/computech/CommonBundle
 */
abstract class AbstractRestController extends Controller
{
    /**
     * Paginated and filtered list of requested entities
     *
     * @param Request $request
     * @param string  $_format
     *
     * @return Response
     */
    public function listAction(Request $request, $_format)
    {
        // Close the session, we won't need it
        $this->get('session')->save();

        // Get request data
        $offset = $request->query->get('offset', 0);
        $limit = $request->query->get('limit', 10);
        $sort = $request->query->get('sort', array());
        $filter = $request->query->get('filter', array());

        // Set cache
        $response = new Response();
        $response->setPublic();
        $response->setMaxAge(5);
        $response->setSharedMaxAge(5);
        $response->setVary('Cookie');

        // Check total record count
        $total = $this->getRecordCount($filter);
        
        // Get the requested summaries
        $summaries = $this->getSummaryColumns($filter);

        // Get the requested objects
        if ($total) {
            $qb = $this->getQueryBuilder('e');

            if ($limit != -1) {
                $qb->setMaxResults($limit);
            }

            $qb->setFirstResult($offset);

            $this->filterQuery($qb, $filter);
            $this->sortQuery($qb, $sort);

            $objects = $qb->getQuery()->execute();
        } else {
            $objects = array();
        }

        // Create the response
        $data = array(
            'objects' => $objects,
            'offset' => $offset,
            'limit' => $limit,
            'total' => $total,
            'summaries' => $summaries
        );
        
        return $this->render( $this->getListTemplate($_format), $data, $response);
    }

    /**
     * View a single object
     *
     * @param mixed   $object
     * @param Request $request
     * @param string  $_format
     *
     * @return Response
     */
    protected function viewObject($object, Request $request, $_format)
    {
        // Check cache freshness
        $response = new Response();
        $response->setPublic();
        $response->setMaxAge(5);
        $response->setSharedMaxAge(5);

        // Create the response
        return $this->render($this->getViewTemplate($_format), array('object' => $object), $response);
    }

    /**
     * Template to render when listing entities
     *
     * @param string $format
     *
     * @return string
     */
    protected function getListTemplate($format)
    {
        return sprintf('@ComputechCommon/Rest/list.%s.twig', $format);
    }

    /**
     * Template to render when viewing an entity
     *
     * @param string $format
     *
     * @return string
     */
    protected function getViewTemplate($format)
    {
        return sprintf('@ComputechCommon/Rest/view.%s.twig', $format);
    }
    
    /**
     * Names of the columns that should be summarised
     *
     * @return array
     */
    protected function getSummaryColumnNames()
    {
        return array();
    }

    /**
     * Sort query based on the request
     *
     * @param \Doctrine\ORM\QueryBuilder &$qb
     * @param array                      $sort
     */
    final protected function sortQuery(&$qb, array $sort)
    {
        foreach ($sort as $sortColumn) {
            $qb->addOrderBy('e.' . $sortColumn['column'], strtoupper($sortColumn['dir']));
        }
    }

    /**
     * Filter query based on the request
     *
     * @param \Doctrine\ORM\QueryBuilder &$qb
     * @param mixed                      $filter
     */
    final protected function filterQuery(&$qb, $filter)
    {
        if (is_array($filter)) {
            foreach ($filter as $field => $filterValue) {
                $this->applyFilter($qb, $field, $filterValue);
            }
        } else {
            foreach ($this->getSerializerMetadata($this->getEntityName())->propertyMetadata as $field => $metadata) {
                $this->applyFilter($qb, $field, $filter, true);
            }
        }
    }

    /**
     * Apply a specific requested filter to the query
     *
     * @param \Doctrine\ORM\QueryBuilder $qb
     * @param string                     $field
     * @param string                     $filter
     * @param boolean                    $global
     *
     * @throws \InvalidArgumentException
     */
    protected function applyFilter($qb, $field, $filter, $global = false)
    {
        $metadata = $this->getDoctrineMetadata($this->getEntityName());
        $identity = false;

        if (isset($metadata->fieldMappings[$field])) {
            $type = $metadata->fieldMappings[$field]['type'];
        } elseif (isset($metadata->associationMappings[$field])) {
            $identity = true;

            $targetEntity = $metadata->associationMappings[$field]['targetEntity'];
            $targetColumn = $metadata->associationMappings[$field]['joinColumns'][0]['referencedColumnName'];
            $targetMetadata = $this->getDoctrineMetadata($targetEntity);
            $targetField = $targetMetadata->fieldNames[$targetColumn];

            $type = $targetMetadata->fieldMappings[$targetField]['type'];
        } else {
            throw new \InvalidArgumentException(sprintf('Unknown filter column "%s"', $field));
        }

        switch ($type) {
            case 'integer':
            case 'decimal':
                if ($global) {
                    $qb->orWhere($qb->expr()->eq('e.' . $field, ':' . $field));
                } else {
                    $qb->andWhere($qb->expr()->eq('e.' . $field, ':' . $field));
                }
                $qb->setParameter($field, (float) $filter);
                break;

            case 'string':
            case 'text':
                if ($identity) {
                    if ($global) {
                        $qb->orWhere($qb->expr()->eq('e.' . $field, ':' . $field));
                    } else {
                        $qb->andWhere($qb->expr()->eq('e.' . $field, ':' . $field));
                    }
                    $qb->setParameter($field, $filter);
                } else {
                    if ($global) {
                        $qb->orWhere($qb->expr()->like('LOWER(e.' . $field . ')', ':' . $field));
                    } else {
                        $qb->andWhere($qb->expr()->like('LOWER(e.' . $field . ')', ':' . $field));
                    }
                    $qb->setParameter($field, '%' . strtolower($filter) . '%');
                }
                break;

            case 'timestamp':
            case 'date':
            case 'time':
                // Dates are too vague to apply global filters
                break;

            default:
                throw new \InvalidArgumentException(
                    sprintf('Filtering for type "%s" has not yet been implemented', $type)
                );
        }
    }

    /**
     * Fetches Doctrine configuration for the entity managed by this controller
     *
     * @param string $entity
     *
     * @return \Doctrine\ORM\Mapping\ClassMetadata
     */
    final protected function getDoctrineMetadata($entity)
    {
        return $this->doctrineMetadata = $this->getDoctrine()->getManagerForClass($entity)->getClassMetadata($entity);
    }

    /**
     * Fetches serialization configuration for the entity managed by this controller
     *
     * @param string $entity
     *
     * @return \Metadata\ClassHierarchyMetadata|\Metadata\MergeableClassMetadata|null
     */
    final protected function getSerializerMetadata($entity)
    {
        return $this->serializerMetadata = $this->get('jms_serializer')->getMetadataFactory()->getMetadataForClass(
            $this->getDoctrineMetadata($entity)->name
        );
    }

    /**
     * Name of the manager of the entity managed by this controller
     *
     * @return string|null
     */
    protected function getEntityManagerName()
    {
        return null;
    }

    /**
     * Builds the base QueryBuilder used to fetch entities
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        return $this->getDoctrine()
            ->getRepository($this->getEntityName(), $this->getEntityManagerName())
            ->createQueryBuilder($alias);
    }

    /**
     * Get the number of records that match the current filter
     *
     * @param array $filter
     *
     * @return int
     */
    protected function getRecordCount(array $filter)
    {
        $qb = $this->getQueryBuilder('e');
        $qb->setMaxResults(1);
        $qb->select($qb->expr()->count('e'));

        $this->filterQuery($qb, $filter);

        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('csclr0', 'csclr0');

        $query = $this->getDoctrine()
            ->getManager($this->getEntityManagerName())
            ->createNativeQuery(preg_replace('/COUNT\(.+?\)/', 'COUNT(*)', $qb->getQuery()->getSQL()), $rsm);

        foreach ($qb->getParameters() as $index => $parameter) {
            $query->setParameter($index + 1, $parameter->getValue(), $parameter->getType());
        }

        return intval($query->getSingleScalarResult());
    }
    
    /**
     * Get the summary columns
     * 
     * @param array $filter
     * 
     * @return int
     */
    protected function getSummaryColumns(array $filter)
    {
        $summaryColumns = $this->getSummaryColumnNames();
        
        if (count($summaryColumns)) {
            $qb = $this->getQueryBuilder('e');
            $qb->setMaxResults(1);
            
            $add = false;
            
            foreach ($summaryColumns as $summaryColumn) {
                if (!$add) {
                    $qb->select('SUM(' . $summaryColumn . ')');
                    
                    $add = true;
                } else {
                    $qb->addSelect('SUM(' . $summaryColumn . ')');
                }
            }

            $this->filterQuery($qb, $filter);

            $results = $qb->getQuery()->getSingleResult();
            
            $return = array();
            
            foreach ($summaryColumns as $index => $summaryColumn) {
                
                $split = explode('.', $summaryColumn);
                $return[$split[1]] = $results[$index + 1];
            }
            
            return $return;
        }
        
        return array();
    }

    /**
     * Name of the entity managed by this controller
     *
     * @return string
     */
    abstract protected function getEntityName();
}
