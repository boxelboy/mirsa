<?php
namespace Mirsa\Bundle\MirsaBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;

/**
 * SActivityAssemblyController
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class ActivityAssemblyController extends AbstractRestController
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
    protected function getSummaryColumnNames() {
        return array('e.assemblyQty', 'e.assemblyQtyCompleted', 'e.assemblyQtyQuarantined', 'e.ppmLevel', 'e.ppmEfficiency');
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'MirsaMirsaBundle:ActivityAssembly';
    }
    
    /**
     * Only fetch Inspection Work Orders records associated with the selected stock record
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        $qb->andWhere($alias . '.assemblyID != :null');
        $qb->setParameter('null', 'N;');

        if (!is_null($this->getUser()->getContact())) { 
            if ($this->getUser()->getContact()->getClient()) {
                $qb->andWhere($alias . '.client = :client');
                $qb->setParameter('client', $this->getUser()->getContact()->getClient());
            }
        }
        
        return $qb;
    }
}
