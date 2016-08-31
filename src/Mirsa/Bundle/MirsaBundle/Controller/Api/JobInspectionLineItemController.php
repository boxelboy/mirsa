<?php
namespace Mirsa\Bundle\MirsaBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;
use Mirsa\Bundle\MirsaBundle\Entity\JobInspectionLineItem;

/**
 * JobInspectionLineItemController
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class JobInspectionLineItemController extends AbstractRestController
{
    /**
     * {@inheritDoc}
     */
    public function listAction(Request $request, $_format)
    {
        return parent::listAction($request, $_format);
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'MirsaMirsaBundle:JobInspectionLineItem';
    }
    
   /**
     * Only records associated with the selected Client record
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        if (!is_null($this->getUser()->getContact())) { 
            if ($this->getUser()->getContact()->getClient()) {
                $qb->andWhere($alias . '.client = :client');
                $qb->setParameter('client', $this->getUser()->getContact()->getClient());
            }
        }
        
        return $qb;
    }        
}
