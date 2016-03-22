<?php
namespace BusinessMan\Bundle\SupportBundle\Form\Type\Assign;

use Doctrine\ORM\EntityRepository;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * SupportCallType
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
 */
class SupportCallType extends AbstractType
{
    /**
     * {@inheritDoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add(
            'assignedTo',
            'entity',
            array(
                'class' => 'BusinessManStaffBundle:Staff',
                'property' => 'displayName',
                'empty_value' => '',
                'query_builder' => function (EntityRepository $repository) use ($builder) {
                    $qb = $repository->createQueryBuilder('s');
                    $qb->addOrderBy('s.forename', 'ASC');
                    $qb->addOrderBy('s.surname', 'ASC');

                    if ($builder->getData()->getAssignedTo()) {
                        $qb->where('s.id != :assignedTo');
                        $qb->setParameter('assignedTo', $builder->getData()->getAssignedTo());
                    }

                    return $qb;
                }
            )
        );
    }

    /**
     * {@inheritDoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(
            array(
                'data_class' => 'BusinessMan\Bundle\SupportBundle\Entity\SupportCall',
            )
        );
    }

    /**
     * {@inheritDoc}
     */
    public function getName()
    {
        return 'ticket';
    }
}
